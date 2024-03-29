const reservedMethods = ["connected", "connectedCallback", "disconnectedCallback", "createDataBinding"]
const template = Symbol("Component Template")
const shadow = Symbol("Component Shadow")
const insert = Symbol("Existing Nodes Insertion Point")
const binds = Symbol("Data Binding Callbacks")
const observer = Symbol("Element Mutation Observer")
const dataBindingCallback = Symbol("Callback for the Observer")
const tag = Symbol("HTML Tag Name")
const original = Symbol("Original Nodes")
const connected = Symbol("DOM Connection Promise")
const resolveConnected = Symbol("DOM Connection resolve")

    
/**
 * Called when a bound data- attribute changes
 * @callback module:micro-mvvm.Component~dataBindingCallback
 * @param {any} value The new value of the attribute
 */

/**
 * Called when the component is connected to the DOM.
 * @param original The original children of this element when the DOM was parsed, before they get replaced by this component's template (if applicable)
 * @public
 * @virtual
 * @function module:micro-mvvm.Component#initialize
 */

/**
 * If shadow is specified in the constructor's parameters, the Component's attached ShadowRoot.
 * @public
 * @name shadowRoot
 * @member {external:ShadowRoot|undefined} module:micro-mvvm.Component#shadowRoot
 */


/**
 * Class to implement a micro-mvvm web component.
 * @virtual
 * @extends external:HTMLElement
 * @alias module:micro-mvvm.Component
 */
export class Component extends HTMLElement {
    [binds] = {}

    /**
     * Setup the component. Protect against overriding important functions.
     * @throws {TypeError} If the constructor is called on Component rather than a subclass.
     * @throws {TypeError} If a subclass overrides any reserved Component methods (connected, connectedCallback, disconnectedCallback, or createDataBinding)
     * @param {object} params - Object containing all the constructor's parameters.
     * @param {(string|function|external:HTMLTemplateElement)} params.template - A string used as this Component's innerHTML, a function that returns a string (called with this bound to the Component, and the Component's dataset as a parameter), or a &lt;template&gt; element to pull a document fragment from.
     * @param {(string|function|external:HTMLTemplateElement)} params.shadow - Works the same as params.template, but attaches a shadow DOM operates on this element's shadowRoot.
     * @param {string} params.insert - If a template (not shadow template) is specified, insert the original children of the component at the time the DOM is parsed inside the first element that matches this selector after replacing the Component's innerHTML with the template.
     * 
     */
    constructor(params) {
        super()
        if (this.constructor === Component) {
            throw new TypeError("Component cannot be instantiated directly")
        }
        if (typeof params !== "undefined") {
            this[template] = params.template
            this[shadow] = params.shadow
            this[insert] = params.insert
        }
        for (const reserved of reservedMethods) {
            if (this[reserved] !== Component.prototype[reserved]) {
                throw new TypeError(`Cannot override Component.prototype[${reserved}]() with ${this.constructor.name}.prototype[${reserved}]()`)
            }
        }

        this[observer] = new MutationObserver(this[dataBindingCallback].bind(this))
        this[connected] = new Promise((resolve) => {
            this[resolveConnected] = resolve
        })
    }

    /**
     * Called when the element is connected to the DOM. This can't be overriden, but child classes can implement initialize()
     * @private
     */
    connectedCallback() {
        if (typeof this[original] === "undefined") {
            this[original] = [...this.childNodes]
        }

        if (typeof this[template] === "function") {
            this.innerHTML = this[template].call(this, this.dataset)
        } else if (typeof this[template] === "string") {
            this.innerHTML = this[template]
        } else if (typeof this[template] === "object" && this[template] instanceof HTMLTemplateElement) {
            this.replaceChildren(this[template].content.cloneNode(true))
        }

        if (typeof this[template] !== "undefined" && typeof this[insert] === "string") {
            this.querySelector(this[insert]).replaceChildren(...this[original])
        }

        if (typeof this[shadow] !== "undefined") {
            this.attachShadow({mode: "open"})
        }
        if (typeof this[shadow] === "function") {
            this.shadowRoot.innerHTML = this[shadow](this.dataset, this.shadowRoot)
        } else if (typeof this[shadow] === "string") {
            this.shadowRoot.innerHTML = this[shadow]
        } else if (typeof this[shadow] === "object" && this[shadow] instanceof HTMLTemplateElement) {
            this.shadowRoot.replaceChildren(this[shadow].content.cloneNode(true))
        }

        if (typeof this.initialize === "function") {
            requestAnimationFrame(this.initialize.bind(this, this[original]))
        }
        //listen for changes to data- attributes for data binding
        this[observer].observe(this, {attributes: true})
        this[dataBindingCallback](Object.keys(this.dataset).map((name) => ({
            attributeName: `data-${name.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`
        })))
        requestAnimationFrame(this[resolveConnected])
    }

    /**
     * Stop the mutation observer from listening
     * @private
     */
    disconnectedCallback() {
        this[observer].disconnect()
        this[connected] = new Promise((resolve) => {
            this[resolveConnected] = resolve
        })
    }

    /**
     * A promise that resolves at the earliest the same animation frame that initialize() is called.
     * @function module:micro-mvvm.Component#connected
     * @async
     */
    connected() {
        return this[connected]
    }

    /**
     * Bind a data- attribute to a function
     * @function module:micro-mvvm.Component#createDataBinding
     * @param {string} source kebab-case name of the data- attribute (without the data- prefix) to listen to
     * @param {module:micro-mvvm.Component~dataBindingCallback} callback The callback that handles the change
     */
    createDataBinding(source, callback) {
        this[binds][source] = callback
    }

    /**
     * Called by the observer when a data- attribute changes for binding
     * @params {Array} records Array of records passed by the observer.
     * @private
     */
    [dataBindingCallback](records) {
        for (const record of records) {
            const matches = record.attributeName.match(/^data-(.+)/i)
            if (matches !== null && matches.length === 2) {
                const source = matches[1]
                const sourceCamel = source
                    .replace(/-([a-z])/, (match, group1) => group1.toUpperCase())
                const bindSelector = `[data-bind^=${source}]`
                const dataUpdate = (target) => {
                    const [, destination] = target.dataset.bind.split(":").map((str) => str.trim())
                    target[destination] = this.dataset[sourceCamel]
                }
                this.querySelectorAll(bindSelector).forEach(dataUpdate)
                if (this.shadowRoot !== null) {
                    this.shadowRoot.querySelectorAll(bindSelector).forEach(dataUpdate)
                }
                if (typeof this[binds][source] === "function") {
                    this[binds][source](this.dataset[sourceCamel])
                }
            }
        }
    }

    /**
     * @private
     */
    get [Symbol.toStringTag]() {
        return this.constructor.name
    }

    /**
     * Register this Component with the specified HTML tag. Can only be called on subclasses of Component.
     * @function module:micro-mvvm.Component.register
     * @static
     * @param {string} tagName The element name to register this Component as. Must be a [valid custom element name]{@link https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name}
     * @returns {module:micro-mvvm.Component} Returns the class register() was called on, making it possible to write something like "export default MyComponentSubclass.register('my-component-sublass')"
     * @throws {TypeError} If register() is called on Component rather than a subclass.
     * @throws {TypeError} If register() has already been called on this class.
     */
    static register(tagName) {
        if (this === Component) {
            throw new TypeError("Cannot register Component as an element")
        } else if (typeof this[tag] !== "undefined") {
            throw new TypeError(`${this.name} already registered as <${this[tag]}>`)
        } else {
            Object.defineProperty(this, tag, {value: tagName})
            customElements.define(tagName, this)
            return this
        }
    }
    /**
     * Getter that returns the tag name this Component is registered as.
     * @member {string} module:micro-mvvm.Component.tag
     * @readonly
     * @static
     */
    static get tag() {
        return this[tag]
    }

    /**
     * create a new instance of this component as a DOM element.
     * @function module:micro-mvvm.Component.create
     * @static
     * @returns {module:micro-mvvm.Component} A new instance of this component that can be inserted into the DOM.
     */
    static create() {
        return document.createElement(this[tag])
    }
}

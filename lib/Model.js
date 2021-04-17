/**
 * @member module:micro-mvvm.Model.Transform
 * @property {function(): external:Response} none - Returns the raw {@link external:Response|Response}.
 * @property {function(): object} json - Parses the response as JSON and returns it as an object.
 * @property {function(): string} text - Interprets the response as text and returns it as a string.
 * @property {function(): external:ArrayBuffer} arrayBuffer - Interprets the response as binary data and returns it as an {@link external:ArrayBuffer|ArrayBuffer}.
 * @property {function(): external:Blob} blob - Interprets the response as binary data and returns it as a {@link external:Blob|Blob}.
 * @property {function(): external:FormData} formData - Parses the response as multipart/form-data and returns it as a {@link external:FormData|FormData} object.
 * @property {function(): boolean} ok - Returns true if the route returned an HTTP status code in the range of 200-299.
 * @property {function(): number} status - Returns the HTTP status code yielded by the route.
 * @property {function(): external:Headers} headers - Returns a key-value map of the route's HTTP response headers as a {@link external:Headers|Headers} object.
 * @property {function(): external:Body} body - Returns the raw response data as a {@link external:ReadableStream|ReadableStream}.
 * @property {function(): external:Body[]} tee - Returns an array of 2 identical {@link external:ReadableStream|ReadableStream} objects containing the raw response data.
 * @property {function(): external:ReadableStreamDefaultReader} reader - Returns a {@link external:ReadableStreamDefaultReader|ReadableStreamDefaultReader} for processing chunks.
 * @property {function()} assign - Parses the response as JSON and assigns the properties to the Model instance's data property. This is recommended for use with subclasses of Model.
 * @property {function(): string} objectURL - Creates an object URL from the response's binary data. Call {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL|URL.revokeObjectURL()} when the object URL is no longer needed in order to prevent memory leaks.
 */

/**
 * Object containing properties defined with {@link module:micro-mvvm.Model#createDataBinding}().
 * @member {external:Proxy} module:micro-mvvm.Model#data
 * @throws {TypeError} If the property being accessed has not been defined with {@link module:micro-mvvm.Model#createDataBinding}.
 */

/**
 * Event emitted before sending the request for a route.
 * Calling preventDefault() prevents the request from being sent.
 * @extends external:CustomEvent
 * @event Model.RequestEvent
 * @memberof module:micro-mvvm.
 * @property {object} detail Data set by the route request that can be manipulated by an event listener.
 * @property {string|external:URL} detail.url URL of the request. This can be modified by an event listener.
 * @property {object} detail.options Options to be passed to the {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch|fetch API}.
 * @property {string} detail.route The name of the route that triggered this event. Modifying this in an event listener has no effect.
 */
class RequestEvent extends CustomEvent {
    constructor(url, options, route) {
        super("request", {cancelable: true, detail: {url, options, route}})
    }
}

/**
 * Event emitted before processing the response from a route.
 * Calling preventDefault() prevents any transforms from being called.
 * @extends external:CustomEvent
 * @event Model.ResponseEvent
 * @memberof module:micro-mvvm.
 * @property {object} detail Data set after the route request completes that can be manipulated by an event listener.
 * @property {external:Response} detail.response Response object from the request API. Event listeners can modify this to change what is sent to the route's transforms.
 * @property {string|external:URL} detail.requestURL The URL requested. Modifying this in an event listener has no effect.
 * @property {string|external:URL} detail.requestOptions Options passed to the {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch|fetch API}. Modifying this in an event listener has no effect.
 * @property {string} detail.route The name of the route that triggered this event. Modifying this in an event listener has no effect.
 */
class ResponseEvent extends CustomEvent {
    constructor(requestURL, requestOptions, response, route) {
        super("response", {cancelable: true, detail: {requestURL, requestOptions, response, route}})
    }
}

/**
 * Event emitted if the request or transforms fail (not if there's an HTTP error response).
 * Calling preventDefault() stops the Error object from being thrown.
 * Setting the responseOverride property causes the route to return the specified value if the event is handled and preventDefault() is called.
 * @extends external:CustomEvent
 * @event Model.FailureEvent
 * @memberof module:micro-mvvm.
 * @property {object} detail Data set if the route request or transforms fail that can be manipulated by an event listener.
 * @property {string|external:URL} detail.requestURL The URL requested. Modifying this in an event listener has no effect.
 * @property {string|external:URL} detail.requestOptions Options passed to the {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch|fetch API}. Modifying this in an event listener has no effect.
 * @property {string} detail.route The name of the route that triggered this event. Modifying this in an event listener has no effect.
 * @property {object} detail.responseOverride If preventDefault() is called on this event, this property can be set to cause the route to return the specified value.
 */
class FailureEvent extends CustomEvent {
    constructor(requestURL, requestOptions, response, route) {
        super("failure", {cancelable: true, detail: {requestURL, requestOptions, route}})
    }
}

const heartbeats = Symbol("Heartbeat Intervals")
const binds = Symbol("Bound Properties")
const baseUrl = Symbol("Base URL for all routes")
const data = Symbol("Model Data Internals")

const proxy_handler = (model) => ({
    get: (target, prop) => {
        if (typeof target[binds][prop] === "undefined") {
            throw new TypeError(`${prop} not bound, call this.createDataBinding(${prop})`)
        }
        const value = Reflect.get(target, prop)
        if (typeof target[binds][prop].get !== "undefined") {
            return model[target[binds][prop].get.route](target[binds][prop].set.params(value, model[data]))
        }
        return value
    },
    set: (target, prop, value) => {
        if (typeof target[binds][prop] === "undefined") {
            throw new TypeError(`${prop} not bound, call this.createDataBinding(${prop})`)
        }
        const success = Reflect.set(target, prop, value)
        if (typeof target[binds][prop].set !== "undefined") {
            model[target[binds][prop].set.route](target[binds][prop].set.params(value, model[data]))
        }
        return success
    }
})

const reservedMembers = ["addRoute", "heartbeat", "cancelHeartbeat", "createDataBinding"]

/**
 * Any route defined by {@link module:micro-mvvm.Model#addRoute|addRoute()}
 * @function [route]
 * @memberof module:micro-mvvm.Model
 * @instance
 * @param {object} [params]
 * @param {string|external:URLSearchParams} [params.query] Parameters to add as a query string
 * @param {external:Blob|external:FormData|external:URLSearchParams|external:ReadableStream|string|object} [params.body] Value to send as the body of the request.
 * @param {object.<string, string>} [params.segments] Key-value pairs to substitute URL segments, for example if the route URL is /user/:id, params.segments could be {id: 1}
 * @param {external:Headers|object<string, string>} [params.headers] Headers to add to the request
 * @returns {external:Response|any} Returns a Response object or the result of the route's transforms being called on the Response object if the route has transforms specified.
 */

/**
 * Process a bound property's value before calling a route.
 * @callback module:micro-mvvm.Model~proxyCallback
 * @param {any} value If called from a getter, the current value of the property. If called from a setter, the new value of the property.
 * @param {object} data The model's internal data object.
 * @return {object} parameters for a {@link module:micro-mvvm.Model#[route]|route} function, in the format {query, body, segments, headers}.
 */

/**
 * Class that can be instantiated on its own or subclassed to connect to an API or represent a data model.
 * @extends external:EventTarget
 * @alias module:micro-mvvm.Model
 */
export class Model extends EventTarget {
    [heartbeats] = {};

    [data] = {[binds]: {}}

    /**
     * Sets up a Model instance.
     * @throws {TypeError} If a subclass overrides a protected function ("addRoute", "heartbeat", "cancelHeartbeat", "createDataBinding")
     * @param {string} [baseUrl=window.location.href] - Absolute URL that all routes will be relative to.
     */
    constructor(_baseUrl) {
        super()
        this.data = new Proxy(this[data], proxy_handler(this))
        this[baseUrl] = new URL(_baseUrl, location.href)
        for (const reserved of reservedMembers) {
            if (this[reserved] !== Model.prototype[reserved]) {
                throw new TypeError(`Cannot override Model.prototype[${reserved}]() with ${this.constructor.name}.prototype[${reserved}]()`)
            }
        }
    }

    static RequestEvent = RequestEvent

    static ResponseEvent = ResponseEvent

    static FailureEvent = FailureEvent

    static Transform = {
        none:        (response) => response,
        json:        (response) => response.json(),
        text:        (response) => response.text(),
        arrayBuffer: (response) => response.arrayBuffer(),
        blob:        (response) => response.blob(),
        formData:    (response) => response.formData(),
        ok:          (response) => response.ok,
        status:      (response) => response.status,
        headers:     (response) => response.headers,
        body:        (response) => response.body,
        tee:         (response) => response.body.tee(),
        reader:      (response) => response.body.getReader(),
        assign:      async (response, _data) => void Object.assign(_data, await response.json()),
        objectURL:   async (response) => URL.createObjectURL(await response.blob())
    }

    /**
     * Adds a function to this Model instance with the key specified by the name parameter
     * @function module:micro-mvvm.Model#addRoute
     * @param {string|Symbol} name Name of the method to add to this instance
     * @param {string|URL} routeUrl URL of the resource this route requests, if it's a string it is resolved against this Model instance's base URL. The path can include named parameters that match the regex pattern ":(.+?)(?=[^a-zA-Z0-9_]|$)", for example "/users/:id". These can be substituted when the route is called.
     * @param {object} [fetchOptions] Options to pass to the {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch|fetch API}.
     * @param {string} [fetchOptions.method="GET"] HTTP method to use for the request.
     * @param {external:Headers|object<string, string>} [fetchOptions.headers] HTTP headers to add to the request. Some headers are set automatically if omitted, such as Content-Type.
     * @param {external:Blob|external:FormData|external:URLSearchParams|external:ReadableStream|string|object} [fetchOptions.body] Default body to send with the request. If a body is specified when calling the route, this value will be overriden.
     * @param {"cors"|"no-cors"|"same-origin"|"navigate"} [fetchOptions.mode="cors"] CORS mode to use for the request.
     * @param {"omit"|"same-origin"|"include"} [fetchOptions.credentials="same-origin"] Controls cross-origin credentials.
     * @param {"default"|"no-store"|"reload"|"no-cache"|"force-cache"|"only-if-cached"} [fetchOptions.cache="default"] Sets the cache behavior.
     * @param {"follow"|"error"|"manual"} [fetchOptions.redirect="follow"] Sets the request behavior if an HTTP redirect is encountered.
     * @param {""|"about:client"|string} [fetchOptions.referrer="about:client"] Sets the request referrer, can be "", "about:client", or a same-origin URL.
     * @param {"no-referrer"|"no-referrer-when-downgrade"|"same-origin"|"origin"|"strict-origin"|"origin-when-cross-origin"|"strict-origin-when-cross-origin"|"unsafe-url"} [fetchOptions.referrerPolicy] Sets the request's referrer behavior.
     * @param {string} [fetchOptions.integrity=""] The request's SRI value
     * @param {boolean} [fetchOptions.keepalive=false] If true, makes it possible for the request to outlive the page.
     * @param {external:AbortSignal} [fetchOptions.signal] Signal to enable communication with an {@link external:AbortController} instance.
     * @param  {...function(external:Response, object): any} [transforms] List of functions to manipulate the Response object, in order. Several are provided in {@link module:micro-mvvm.Model.Transform}, but any functions can be provided that take an object as the first argument and (optionally) this Model's internal data object as the second, then return either the final value for the route to return or a value to be processed by the next transform.
     */
    addRoute(name, routeUrl, fetchOptions = {}, ...transforms) {
        this[name] = async (_params) => {
            const params = _params ?? {}
            let {query, body} = params
            const segments = params.segments
            let url = routeUrl
            if (typeof fetchOptions === "function") {
                transforms = transforms || []
                transforms.unshift(fetchOptions)
                fetchOptions = null
            }
            const options = {...(fetchOptions ?? {})}
            const routeBaseUrl = this[baseUrl].href ?? location.href
            options.headers = {...(options.headers || {}), ...(params.headers || {})}
            if (typeof body === "object" && !(body instanceof FormData ||
                body instanceof URLSearchParams || body instanceof Blob ||
                body instanceof ReadableStream)) {
                options.headers["content-type"] = (typeof params.headers !== "undefined" && params.headers["content-type"]) || "application/json"
                body = JSON.stringify(body)
            }
            if (typeof body !== "undefined") {
                options.body = body
            }
            if (typeof url === "string") {
                url = new URL(url, routeBaseUrl)
            }
            if (typeof segments !== "undefined") {
                url.pathname = url.pathname.replace(/:(.+?)(?=[^a-zA-Z0-9_]|$)/g, (match, group1) => segments[group1])
            }
            if (typeof query !== "undefined") {
                if (query.constructor.name !== "URLSearchParams") {
                    query = new URLSearchParams(query)
                }
                url.search = query
            }
            const requestEvent = new RequestEvent(url, options, name)
            this.dispatchEvent(requestEvent)
            if (requestEvent.defaultPrevented) {
                return
            }
            const failureEvent = new FailureEvent(requestEvent.detail.url, requestEvent.detail.options, name)
            let returnValue
            try {
                const response = await fetch(requestEvent.detail.url, requestEvent.detail.options)
                const responseEvent = new ResponseEvent(requestEvent.detail.url, requestEvent.detail.options, response, name)
                this.dispatchEvent(responseEvent)
                failureEvent.detail.response = responseEvent.detail.response
                if (responseEvent.defaultPrevented) {
                    return
                }
                returnValue = response
                if (Array.isArray(transforms)) {
                    for (const transform of transforms) {
                        returnValue = await transform(returnValue, this[data])
                    }
                }
            } catch (error) {
                failureEvent.detail.error = error
                this.dispatchEvent(failureEvent)
                if (!failureEvent.defaultPrevented) {
                    throw error
                }
                returnValue = await failureEvent.responseOverride
            }
            return returnValue
        }
        if (typeof fetchOptions !== "undefined") {
            this[name].method = fetchOptions.method
        }
    }

    /**
     * Set up a route to be called on a regular interval. Model.addRoute() must be called first to create the route. Only one heartbeat can be set up per route.
     * @function module:micro-mvvm.Model#heartbeat
     * @param {string} route The route to call on an interval.
     * @param {number} interval Millesconds between each call.
     * @param {any} heartbeatPayload If the route's method is PUT, POST, or PATCH, the request body. Otherwise, query parameters.
     */
    heartbeat(route, interval, heartbeatPayload) {
        const payload = {}
        if (typeof this[heartbeats][route] !== "undefined") {
            this.cancelHeartbeat(route)
        }
        if (typeof heartbeatPayload !== "undefined") {
            if (typeof heartbeatPayload.query !== "undefined" ||
                typeof heartbeatPayload.body !== "undefined") {
                Object.assign(payload, heartbeatPayload)
            } else if (typeof this[route].method !== "undefined" &&
                ["put", "post", "patch"].includes(this[route].method.toLowerCase())) {
                payload.body = heartbeatPayload
            } else {
                payload.query = heartbeatPayload
            }
        }
        this[heartbeats][route] = setInterval(() => void this[route](payload), interval)
    }

    /**
     * Stop and delete a heartbeat set up with Model.heartbeat(). Silently returns if the heartbeat is not set up or the route doesn't exist.
     * @function module:micro-mvvm.Model#cancelHeartbeat
     * @param {string} route The route that was previously set up with Model.heartbeat().
     */
    cancelHeartbeat(route) {
        clearInterval(this[heartbeats][route])
        delete this[heartbeats][route]
    }

    /**
     * Set up properties on the Model's internal data object.
     * Keep in mind that routes are async, so if a getter is defined the property's value will be retrieved as a promise that resolves with the result of a route.
     * If a setter is defined the value will update synchronously but the route may not have completed by the next time the property's value is retrieved.
     * @function module:micro-mvvm.Model#createDataBinding
     * @param {string} property The name of the property to define for the Model's data object.
     * @param {object} [handler] Object to define getters and setters for the property.
     * @param {object} [handler.get] Getter behavior for the property. Leave undefined for pass-through.
     * @param {string} handler.get.route Route to call when the property's value is retrieved
     * @param {module:micro-mvvm.Model~proxyCallback} handler.get.params Function to take the property's value and return valid route parameters.
     * @param {object} [handler.set] Setter behavior for the property. Leave undefined for pass-through.
     * @param {string} handler.set.route Route to call when the property's value is modified
     * @param {module:micro-mvvm.Model~proxyCallback} handler.set.params Function to take the property's new value and return valid route parameters.
     */
    createDataBinding(property, handler = {}) {
        if (property === binds) {
            throw new TypeError(`Cannot bind [[${binds.description}]]`)
        }
        this[data][binds][property] = handler || {}
    }

    /**
     * @function module:micro-mvvm.Model#toJSON
     * @returns {object} A deep clone of this Model's internal data object, valid JSON only.
     */
    toJSON() {
        return JSON.parse(JSON.stringify(this[data]))
    }

    get [Symbol.toStringTag]() {
        return "Model"
    }
}
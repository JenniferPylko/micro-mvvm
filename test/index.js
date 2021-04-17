import * as μ from "/micro-mvvm"

class CounterTest extends μ.Component {
    constructor() {
        super({
            template: μ.html`
            <span data-bind="counter-parameter:innerText">
            </span>`
        })
    }

    initialize() {
        setInterval(() => {
            this.dataset.counterParameter = 1 + (parseInt(this.dataset.counterParameter) || 0)
        }, 1000)
    }
}

CounterTest.register("counter-test")

class AlertRandomTest extends μ.Component {
    constructor() {
        super({
            template: μ.html`<button>Click</button>`
        })
    }

    initialize() {
        this.createDataBinding("alert-parameter", alert.bind(window))
        this.querySelector("button").addEventListener("click", () => {
            this.dataset.alertParameter = Math.random()
        })
    }
}

AlertRandomTest.register("alert-random-test")

class RedTextTest extends μ.Component {
    constructor() {
        super({
            template: μ.html`<div id=red-text-container style="color:red"></div>`,
            insert: "#red-text-container"
        })
    }
}

RedTextTest.register("red-text-test")

class ShadowTest extends μ.Component {
    constructor() {
        super({
            shadow: μ.html`<slot name=sample-text style="color:green"></slot>`
        })
    }
}

ShadowTest.register("shadow-test")

class TemplateTest extends μ.Component {
    constructor() {
        super({
            template: document.querySelector("#template-test")
        })
    }
}

TemplateTest.register("template-test")

class UserTest extends μ.Model {
    constructor() {
        super(location.origin + "/api/user")
        this.addRoute("load_data", "", μ.Model.Transform.assign)

        this.createDataBinding("id")
        this.createDataBinding("username")
    }

    async initialize(id) {
        await this.load_data({query: {id}})
    }
}

const user = new UserTest()
user.initialize(1).then(() => document.querySelector("#model-test").innerText = JSON.stringify(user.toJSON()))
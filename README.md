[Read the full documentation here](https://brpylko.github.io/micro-mvvm/index.html)

This module is an MVVM framework intended to stick as close to vanilla APIs possible. The 2 main parts are a Component class and a Model class.

## micro-mvvm.Component

The Component class is used to define new HTML elements with complex behaviors:

```js
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

export default CounterTest.register("counter-test")
```

```html
<div>
    This counter should start at 5 and go up every second:
    <counter-test data-counter-parameter=5></counter-test>
</div>
```

## micro-mvvm.Model

The Model class is used to communicate with an HTTP API. A single Model instance can be used for an entire API, or Model can be subclassed to represent different data models.

### Entire API Style

```js
import * as μ from "micro-mvvm"

const API = new μ.Model()

API.addRoute("dashboard", "/api/dashboard", μ.Model.Transform.json)
API.addRoute("change_password", "/api/change_password", μ.Model.Transform.ok, {method: "post"})

export default API
```

```js
import API from "./[path-to-api-file].js

const dashboard_data = await API.dashboard()
// do something with the retrieved data

// event listener or similar
if (!await API.change_password({body: {old_password, new_password}})) {
    alert("Error changing password")
}
```

### Data Model Style

```js
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
user.initialize(1).then(() => console.log(user.toJSON()))
//logs {id: "...", username: "..."}
```

## micro-mvvm.html

Template tagging function that automatically recursively joins arrays with an empty string and calls any functions that are present as substitutions.

```js
const output = μ.html`<div>${() => ["Separate ", "Tokens ", "Here"]}</div>`
//output: <div>Separate Tokens Here</div>
```

## Compatibility

This module requires the following features:

* `Symbol`
* `Promise`
* classes
* `async`/`await`
* `const`
* rest/spread operator
* fetch API
* custom elements
* `ShadowRoot`
* `Proxy`
* `Reflect`
* `CustomEvent`
* `MutationObserver`
/**
 * @module module:micro-mvvm
 */

/**
 * Object representing the DOM element &lt;template&gt;
 * @global
 * @external EventTarget
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget|EventTarget}
 */

/**
 * Object representing a non-standard JavaScript event.
 * @global
 * @external CustomEvent
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent|CustomEvent}
 */

/**
 * Response object from a fetch request.
 * @global
 * @external Response
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response|Response}
 */

/**
 * Object that represents raw binary data.
 * @global
 * @external ArrayBuffer
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer|ArrayBuffer}
 */

/**
 * Object that represents raw binary data.
 * @global
 * @external Blob
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob|Blob}
 */

/**
 * Key-value map object representing data with the MIME type multipart/form-data.
 * @global
 * @external FormData
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/FormData|FormData}
 */

/**
 * Key-value map object representing HTTP headers.
 * @global
 * @external Headers
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Headers|Headers}
 */

/**
 * A raw stream of bytes.
 * @global
 * @external ReadableStream
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream|ReadableStream}
 */

/**
 * An interface for processing chunks of a ReadableStream
 * @global
 * @external ReadableStreamDefaultReader
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader|ReadableStreamDefaultReader}
 */

/**
 * A view to represent binary data in an object similar to a JavaScript array.
 * @global
 * @external TypedArray
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray|TypedArray}
 */

/**
 * An interface to manipulate a URL's query string.
 * @global
 * @external URLSearchParams
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams|URLSearchParams}
 */

/**
 * Object used to communicate with an {@link external:AbortController}.
 * @global
 * @external AbortSignal
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal|AbortSignal}
 */

/**
 * Interface for aborting processes that obey {@link external:AbortSignal}s.
 * @global
 * @external AbortController
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController|AbortController}
 */

/**
 * Interface to intercept operations on a JavaScript Object. NOT an HTTP proxy.
 * @global
 * @external Proxy
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy|Proxy}
 */

/**
 * Object representing a DOM element
 * @global
 * @external HTMLElement
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement|HTMLElement}
 */

/**
 * Object representing the DOM element &lt;template&gt;
 * @global
 * @external HTMLTemplateElement
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement|HTMLTemplateElement}
 */

/**
 * Shadow root attached to an element.
 * @global
 * @external ShadowRoot
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot|ShadowRoot}
 */

export * from "./Component.js"
export * from "./html.js"
export * from "./Model.js"
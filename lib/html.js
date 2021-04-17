const stringify = (any) => {
    if (Array.isArray(any)) {
        return any.map(stringify).join("")
    } else if (typeof any === "function") {
        return stringify(any())
    }
    return any

}

/**
 * Template tagging function that automatically recursively joins arrays with an empty string and calls any functions that are present as substitutions.
 * @alias module:micro-mvvm.html
 * @returns {string}
 */
export const html = (strings, ...subs) =>
    subs.reduce((acc, str, index) =>
        acc.concat(stringify(str), strings[index + 1]), strings[0])

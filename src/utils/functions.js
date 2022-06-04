import {getCurrentInstance} from 'vue'

export function pauseEvent(e) {
    e.stopPropagation();
    e.preventDefault();
    e.cancelBubble = true;
    return false;
}

const ESCAPE_CHAR = {
    '=': '%3D',
    '#': '%23',
    '&': '%26',
    ' ': '%20'
}

export function escape(str) {
    for (let i in ESCAPE_CHAR) {
        str = str.replaceAll(i, ESCAPE_CHAR[i])
    }
    return str
}

export function throttle(fn, delay) {
    let valid = true
    return function () {
        if (!valid) {
            return false
        }
        valid = false
        setTimeout(() => {
            fn(...arguments)
            valid = true;
        }, delay)
    }
}

export function debounce(fun, delay) {
    return function () {
        const args = arguments
        clearTimeout(fun.id)
        fun.id = setTimeout(() => {
            fun(...args)
        }, delay)
    }
}

function _FlexObject(item) {
    this.val = item
}

_FlexObject.prototype = {
    get value() {
        if (Object.keys(this.val).length)
            return this.val
        return null
    },
    append(key, value) {
        if (!this.val[key]) {
            this.val[key] = value
        } else if (this.val[key].constructor === Array) {
            this.val[key].append(value)
        } else if (this.val[key]) {
            this.val[key] = [this.val[key], value]
        }
    }
}

export function flexObject(item) {
    return new _FlexObject(item)
}

// console.log()
export function globals() {
    return getCurrentInstance().appContext.config.globalProperties
}

export function getBool(str) {
    return str === '1'
}

export function deepClone(obj) {
    if (Array.isArray(obj)) {
        return obj.map(deepClone)
    } else if (obj && typeof obj === 'object') {
        let cloned = {}
        let keys = Object.keys(obj)
        for (let i = 0, l = keys.length; i < l; i++) {
            let key = keys[i]
            cloned[key] = deepClone(obj[key])
        }
        return cloned
    } else {
        return obj
    }
}

export const NULL = 0
export const STRING = 1
export const ARRAY = 2
export const OBJECT = 3
export const NUMBER = 4
export const BOOLEAN = 5
export const UNDEFINED = 6
export const SYMBOL = 7
export const FUNCTION = 8
export const DEFAULT = 9

export const isDev = process.env.NODE_ENV === "development"

export function getTitle(item) {
    return item.name || item.url || "Untitled Request"
}

export function hasProperty(obj, value) {
    return Object.hasOwnProperty.call(obj, value)
}

export function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
}

export function isArray(arr) {
    return arr && arr.constructor === Array
}

export function isStr(str) {
    return typeof str === "string"
}

export function isNumber(val) {
    return typeof val === 'number';
}

export function isBoolean(val) {
    return typeof val === "boolean";
}

export function isUndefined(val) {
    return typeof val === "undefined";
}

export function isSymbol(val) {
    return typeof val === "symbol";
}

export function isFunction(val) {
    return typeof val === "function";
}

export function getType(obj) {
    if (isArray(obj)) return ARRAY
    if (isObject(obj)) return OBJECT
    if (isStr(obj)) return STRING
    if (obj === null) return NULL
    if (isNumber(obj)) return NUMBER
    if (isBoolean(obj)) return BOOLEAN
    if (isUndefined(obj)) return UNDEFINED
    if (isFunction(obj)) return FUNCTION
    if (isSymbol(obj)) return SYMBOL
    return DEFAULT
}

export function toString(val) {
    switch (getType(val)) {
        case NULL:
            return "null"
        case STRING:
            return `"${val}"`
        case ARRAY:
            return val.length < 10 ? JSON.stringify(val) : `[ Array(${val.length}) ]`
        case OBJECT:
            return JSON.stringify(val)
        case NUMBER:
        case BOOLEAN:
        case SYMBOL:
        case FUNCTION:
            return val.toString()
        case UNDEFINED:
            return 'undefined'
        case DEFAULT:
            return "Unknown type"
    }
}

export function reload() {
    location.reload()
}

export class Queue {
    constructor(capacity) {
        this.head = 0
        this.tail = 0
        this.length = 0
        this.capacity = capacity
        this.queue = new Array(capacity)
    }

    empty() {
        return !this.length
    }

    full() {
        return this.length === this.capacity
    }

    push(value) {
        if (this.full()) {
            return false
        }
        this.queue[this.tail] = value
        if (this.tail >= this.capacity - 1) {
            this.tail = 0
        } else {
            this.tail++
        }
        this.length++
        return true
    }

    pop() {
        if (this.empty()) {
            return false
        }
        const data = this.queue[this.head]
        this.queue[this.head] = undefined
        if (this.head >= this.capacity - 1) {
            this.head = 0
        } else {
            this.head++
        }
        this.length--
        return data
    }

    get() {
        return this.queue.filter(v => v !== undefined)
    }
}

export function getServer(path = "") {
    return (localStorage.getItem('server') || "") + path
}

export function sleep(min, max) {
    if (max === undefined) max = min
    min *= 1000;
    max *= 1000;
    const time = !min ? max : Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise((resolve) => setTimeout(resolve, time));
}

export const FILE_FORMAT = {
    "text/plain": "text",
    "application/json": "json",
    "text/html": "html",
    "application/xml": "xml",
    "application/javascript": "javascript"
}
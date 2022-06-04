import store from "@/store";
const result = store.state.requests.result
const info = store.state.requests.value.info
const environment = store.state.environment
import shortid from 'shortid'
import {
	NULL,
	STRING,
	ARRAY,
	OBJECT,
	NUMBER,
	BOOLEAN,
	UNDEFINED,
	SYMBOL,
	FUNCTION,
	getType,
	toString,
	isArray,
	hasProperty
} from "@/utils/functions";

const DATA_TYPE = {
	NULL,
	STRING,
	ARRAY,
	OBJECT,
	NUMBER,
	BOOLEAN,
	UNDEFINED,
	SYMBOL,
	FUNCTION,
}

class Headers{
	static get(key){
		return result.params[key]
	}

	static set(key, value){
		result.params[key] = value
	}
}

class Params{
	static get(key){
		return result.params[key]
	}

	static set(key, value){
		result.params[key] = value
	}
}

class Body{
	static dataType(){
		return result.body.dataType
	}
	static type(){
		return result.body.type
	}
	static get(){
		return result.body.value
	}
	static set(value){
		result.body.value = value
	}
}

function getCurrentEnv(){
	return environment.envContentList.get(info.environment)
}

class Env{
	static get(key){
		for(const i of getCurrentEnv()){
			if(key === i[0]) {
				return i[2]
			}
		}
		return null
	}
	static set(key, value){
		const arr = getCurrentEnv()
		for(const i of arr){
			if(key === i[0]) {
				i[2] = value
				return
			}
		}
		arr.push([key, value, value, true, shortid.generate()])
	}
	static delete(key){
		const arr = getCurrentEnv()
		for(const i in arr){
			if(key === arr[i][0]) {
				arr.splice(i, 1)
			}
		}
	}
}


class Request{
	static body = Body
	static params = Params
	static headers = Headers
}

export const testResult = {
	test: []
}


function test(description, func){
	try{
		func()
		testResult.test.push({
			description,
			status: "passed"
		})
	}catch (e){
		testResult.test.push({
			description,
			message: e.toString(),
			status: "failed"
		})
	}
}

class SearchMap extends Map{
	constructor() {
		super(...arguments);
	}
	get(key){
		return super.get(key.toLowerCase())
	}
}

class Response{
	constructor(response) {
		this.response = response?.data
		this.time = response?.time
	}

	get to(){
		const self = this
		return {
			have:{
				status: (code) => {
					const status_code = getType(code) === NUMBER ? self.response.status_code : self.response.raw.statusMessage
					assert(code === status_code, `expected response to have status code ${toString(code)} but got ${toString(status_code)}`)
					return true
				},
				body(data){
					assert(self.response.data.toString().includes(data), "expected response body to have " + toString(data))
					return true
				},
				header(header){
					assert(hasProperty(self.response.headers, header.toLowerCase()), `expected response headers to have ${header}`)
					return true
				},
			},
			not:{
				have:{
					status: (code) => {
						const status_code = self.response.status_code
						assert(code !== status_code, `expected response to not have status code ${toString(code)}, got ${toString(status_code)}`)
						return true
					},
					body(data){
						assert(!self.response.data.toString().includes(data), "expected response to not have body")
						return true
					},
					header(header){
						assert(!hasProperty(self.response.headers, header.toLowerCase()), `expected response headers to not have ${header}`)
						return true
					}
				},
			}
		}
	}

	json(){
		return JSON.parse(this.response.data)
	}

	text(){
		return this.response.data.toString()
	}

	get headers(){
		return new SearchMap(Object.entries(this.response.headers))
	}

	get responseTime(){
		return this.time.total
	}

	get cookies(){
		return this.response.cookies
	}

	get code(){
		return this.response.status_code
	}
}

class AssertionError extends Error{
	constructor(msg) {
		super(msg);
		this.name = "AssertionError"
	}
}

function assert(condition, msg){
	if(!condition) throw new AssertionError(msg)
}

function _empty(obj){
	const hint = "empty can only be used on String, Object, Array"
	switch (getType(obj)){
		case NULL:
			return assert(false, hint)
		case STRING:
			return !obj.length
		case ARRAY:
			return !obj.length
		case OBJECT:
			return !Object.getOwnPropertyNames(obj).length
		case NUMBER:
			return assert(false, hint)
		case BOOLEAN:
			return assert(false, hint)
		case UNDEFINED:
			return assert(false, hint)
		case SYMBOL:
			return assert(false, hint)
		case FUNCTION:
			return assert(false, hint)
		default:
			return assert(false, "Unknown type")
	}
}

function _equal(obj, value){
	const type = getType(obj)
	if(getType(value) !== type) return false
	switch(type){
		case ARRAY:
			for(let i = 0; i < obj.length; i++)
				if(!_equal(obj[i], value[i])) return false
			return true
		case OBJECT:
			if(Object.keys(obj).length !== Object.keys(value).length) return false
			for(const i in obj){
				if(!hasProperty(value, i)) return false
				if(!_equal(obj[i], value[i])) return false
			}
			return true
		case NULL:
		case STRING:
		case NUMBER:
		case BOOLEAN:
		case UNDEFINED:
		case SYMBOL:
		case FUNCTION:
			return obj === value
		default:
			return assert(false, "Unknown type")
	}
}

function _below(obj, value){
	assert(getType(obj) === NUMBER || getType(value) === NUMBER, "expected value to be Number")
	return obj < value
}

function _a(obj, type){
	assert(getType(type) === STRING, "expected type string must be string")
	type = type.toUpperCase()
	assert(hasProperty(DATA_TYPE, type), "Unknown data type")
	return type
}

function expect(obj){
	return {
		to:{
			not: {
				be: {
					get empty(){
						assert(!_empty(obj), "expected " + obj + " not to be empty")
						return true
					},
					equal(value){
						assert(!_equal(obj, value), "expected " + toString(obj) + " not to be equal " + toString(value))
						return true
					},
					below(value){
						assert(!_below(obj, value), "expected " + obj + " to not be below " + value)
						return true
					},
					above(value){
						assert(_below(obj, value), "expected " + obj + " to not be above " + value)
						return true
					},
					oneOf(arr){
						assert(isArray(arr), "expected data set to be Array")
						for(const i of arr){
							if(_equal(obj, i)){
								return assert(false, `expected ${toString(obj)} not to be one of ${toString(arr)}`)
							}
						}
						return true
					},
					a(type){
						type = _a(obj, type)
						assert(getType(obj) !== DATA_TYPE[type], `expected ${toString(obj)} type not to be ${type}`)
						return true
					}
				}
			},
			be:{
				get empty(){
					assert(_empty(obj), "expected " + toString(obj) + " to be empty")
					return true
				},
				equal(value){
					assert(_equal(obj, value), "expected " + toString(obj) + " to be equal " + toString(value))
					return true
				},
				below(value){
					assert(_below(obj, value), "expected " + obj + " to be below " + value)
					return true
				},
				above(value){
					assert(!_below(obj, value), "expected " + obj + " to be above " + value)
					return true
				},
				oneOf(arr){
					assert(isArray(arr), "expected data set to be Array")
					for(const i of arr){
						if(_equal(obj, i)){
							return true
						}
					}
					assert(false, `expect ${toString(obj)} to be one of ${toString(arr)}`)
				},
				a(type){
					type = _a(obj, type)
					assert(getType(obj) === DATA_TYPE[type], `expected ${toString(obj)} type to be ${type}`)
					return true
				}
			}
		},
	}
}

class RR {
	request = Request
	env = Env
	test = test
	expect = expect
	assert = assert
	constructor(response) {
		this.response = new Response(response)
	}
}

export default RR
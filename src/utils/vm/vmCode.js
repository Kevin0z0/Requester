import {hasProperty} from "@/utils/functions";

const {require} = window
const {NodeVM} = require("vm2");
import RR from './RequesterHandler'
// const vm = require('vm');
import eventHandler from "./eventHandler";
import {EventEmitter} from 'events'
const remote = require('electron').remote
import error from './bus'
// console.log()
const funcs = {
	setTimeout: remote.getGlobal('setTimeout'),
	setInterval: remote.getGlobal('setInterval'),
	clearTimeout: remote.getGlobal('clearTimeout'),
	clearInterval: remote.getGlobal('clearInterval'),
}

const initCode = `
module.exports = function(){
return new Promise((resolve, reject) => {
	try{
		|
	}catch(e){
		error.error = e.toString()
		$_event_$.removeAllListeners()
		reject()
	}
	if($_count_$ === 0) {
		$_event_$.removeAllListeners()
		return resolve()
	}
	$_event_$.once("finish", ()=>{
		$_event_$.removeAllListeners()
		resolve()
	})
	$_event_$.once("abort", ()=>{
		try{
			error.error = "abort"
			const timeout = $_setTimeout_$.entries()
			const interval = $_setInterval_$.entries()
			let timeoutNum = timeout.next()
			while(!timeoutNum.done){
				clearTimeout(timeoutNum.value[0])
				timeoutNum = timeout.next()
			}
			let intervalNum = interval.next()
			while(!intervalNum.done){
				clearTimeout(intervalNum.value[0])
				intervalNum = interval.next()
			}
		}catch(e){
			error.error = e.toString()
		}
		$_event_$.removeAllListeners()
		reject()
	})
})
}()`

const printValue = {
	log(data){
		console.log(...JSON.parse(data))
	},
	error(data){
		console.error(...JSON.parse(data))
	},
	warn(data){
		console.warn(...JSON.parse(data))
	}
}

class VMCode{
	constructor(code, obj) {
		this.code = eventHandler(initCode.replace('|', code))
		this.status = new EventEmitter()
		let response = undefined
		if(hasProperty(obj, 'response')){
			response = {
				data: obj.response,
				time: obj.time
			}
			delete obj.response
			delete obj.time
		}
		this.vm = new NodeVM({
			require: {
				external: true,
				root: "./",
				builtin: ['crypto']
			},
			sandbox: {
				...obj,
				...funcs,
				$_event_$: this.status,
				error,
				rr: new RR(response),
				_console: printValue
			}
		});
	}

	runCode(){
		try{
			return this.vm.run(this.code)
		}
		catch (e){
			return new Promise((_, rej)=>{
				rej({error: e.toString()})
			})
		}
	}

	abort(){
		this.status.emit("abort")
	}
}

export default VMCode
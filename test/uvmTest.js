const {NodeVM} = require("vm2");
const error = {error: null}
const EventEmitter = require('events').EventEmitter;

function runCode(code, obj){
	const vm = new NodeVM({
		require: {
			external: true
		},
		sandbox: {
			error,
			EventEmitter
		}
	});
	return vm.run(`
	let $_count_$ = 0
	const $_event_$ = new EventEmitter()
	const _setTimeout = setTimeout
	setTimeout = function(callback, time){
		$_count_$++
		return _setTimeout(function(){
			callback()
			$_count_$--
			if(!$_count_$){
				$_event_$.emit("finish")
			}
		}, time)
	}
	const _setInterval = setInterval
	setInterval = function(callback, time){
		$_count_$++
	}
	module.exports = function(){
		try{
			|
		}catch(e){
			error.error = e.toString()
			return new Promise((_, reject)=>{
				reject(error)
			})
		}
		return new Promise((resolve, reject)=>{
			$_event_$.on("finish", ()=>{
				resolve(error)
			})
		})
	}()`.replace('|', code));
}

runCode("setTimeout(()=>{console.log(111)}, 1000); console.log(1122)").then(err=>{
	console.log(err)
}).catch(v=>{
	console.log(v)
})

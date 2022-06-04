const EventEmitter = require('events').EventEmitter;
let $_count_$ = 0
const $_event_$ = new EventEmitter()
// function _setTimeout(){}
const _setTimeout = setTimeout
global.setTimeout = function (callback, time){
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
global.setInterval = function (callback, time){
	$_count_$++
	return _setInterval(function(){
		callback()
	}, time)
}

const _clearTimeout = clearTimeout
global.clearTimeout = function (handler){
	_clearTimeout(handler)
	$_count_$--
	if(!$_count_$){
		$_event_$.emit("finish")
	}
}

const _clearInterval = clearInterval
global.clearInterval = function (handler){
	_clearInterval(handler)
	$_count_$--
	if(!$_count_$){
		$_event_$.emit("finish")
	}
}

const time = setInterval(()=>{
	console.log(111)
}, 1000)

setTimeout(()=>{
	clearInterval(time)
}, 5000)

$_event_$.on('finish',()=>{
	console.log('finish')
})
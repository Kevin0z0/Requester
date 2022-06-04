let {parentPort } = require('worker_threads');

parentPort.once('message', (message) => {
	parentPort.postMessage(message);
});

setTimeout(()=>{
	console.log(111)
}, 1000)
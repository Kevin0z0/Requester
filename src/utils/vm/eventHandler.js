const d = `
let $_count_$ = 0;
let o = setTimeout;

const $_setTimeout_$ = new Set();
const $_setInterval_$ = new Set();

function checkEvent() {
    $_count_$--;
    if (!$_count_$) {
        $_event_$.emit("finish");
    }
};
setTimeout = function (callback, time) {
    $_count_$++;
    const handler = o(function () {
        callback();
        checkEvent();
    }, time)
    $_setTimeout_$.add(handler);
    return handler;
};
let z = setInterval;
setInterval = function (callback, time) {
    $_count_$++;
    const handler = z(function () {
        callback();
    }, time);
    $_setInterval_$.add(handler);
    return handler;
};
let x = clearTimeout;
clearTimeout = function (handler) {
    x(handler);
    checkEvent();
    $_setTimeout_$.delete(handler);
};
let v = clearInterval;
clearInterval = function (handler) {
    v(handler);
    checkEvent();
    $_setInterval_$.delete(handler);
}

console = {
	log(){
		_console.log(JSON.stringify([...arguments]))
	},
	error(){
		_console.error(JSON.stringify([...arguments]))
	},
	warn(){
		_console.warning(JSON.stringify([...arguments]))
	}
}
`
export default function (c){
	return d + c
}
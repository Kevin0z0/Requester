const { require } = window
const net = require("net")
const tls = require("tls")
const url = require("url")
const assert = require("assert");
// const agent_base = require("agent-base");
const Buffer = require('buffer').Buffer
import * as agent_base from 'agent-base'

function parseProxyResponse(socket) {
	return new Promise((resolve, reject) => {
		let buffersLength = 0;
		const buffers = [];
		function read() {
			const b = socket.read();
			if (b)
				ondata(b);
			else
				socket.once('readable', read);
		}
		function cleanup() {
			socket.removeListener('end', onend);
			socket.removeListener('error', onerror);
			socket.removeListener('close', onclose);
			socket.removeListener('readable', read);
		}
		function onclose() {

		}
		function onend() {

		}
		function onerror(err) {
			cleanup();
			reject(err);
		}
		function ondata(b) {
			buffers.push(b);
			buffersLength += b.length;
			const buffered = Buffer.concat(buffers, buffersLength);
			const endOfHeaders = buffered.indexOf('\r\n\r\n');
			if (endOfHeaders === -1) {
				read();
				return;
			}
			const firstLine = buffered.toString('ascii', 0, buffered.indexOf('\r\n'));
			const statusCode = +firstLine.split(' ')[1];
			resolve({
				statusCode,
				buffered
			});
		}
		socket.on('error', onerror);
		socket.on('close', onclose);
		socket.on('end', onend);
		read();
	});
}


class HttpsProxyAgent extends agent_base.Agent {
	constructor(_opts) {
		let opts;
		if (typeof _opts === 'string') {
			opts = url.parse(_opts);
		} else {
			opts = _opts;
		}
		if (!opts) {
			throw new Error('an HTTP(S) proxy server `host` and `port` must be specified!');
		}
		super(opts);
		const proxy = Object.assign({}, opts);
		this.secureProxy = opts.secureProxy || isHTTPS(proxy.protocol);
		proxy.host = proxy.hostname || proxy.host;
		if (typeof proxy.port === 'string') {
			proxy.port = parseInt(proxy.port, 10);
		}
		if (!proxy.port && proxy.host) {
			proxy.port = this.secureProxy ? 443 : 80;
		}
		if (this.secureProxy && !('ALPNProtocols' in proxy)) {
			proxy.ALPNProtocols = ['http 1.1'];
		}
		if (proxy.host && proxy.path) {
			delete proxy.path;
			delete proxy.pathname;
		}
		this.proxy = proxy;
	}

	async callback(req, opts) {
		const {proxy, secureProxy} = this;
		let socket;
		if (secureProxy) {
			socket = tls.connect(proxy);
		} else {
			socket = net.connect(proxy);
		}
		socket.once('timeout', ()=>{
			req.emit('timeout')
		})
		const headers = Object.assign({}, proxy.headers);
		const hostname = `${opts.host}:${opts.port}`;
		let payload = `CONNECT ${hostname} HTTP/1.1\r\n`;

		if (proxy.auth) {
			headers['Proxy-Authorization'] = `Basic ${Buffer.from(proxy.auth).toString('base64')}`;
		}

		let {host, port, secureEndpoint} = opts;
		if (!isDefaultPort(port, secureEndpoint)) {
			host += `:${port}`;
		}
		headers.Host = host;
		headers.Connection = 'close';
		for (const name of Object.keys(headers)) {
			payload += `${name}: ${headers[name]}\r\n`;
		}
		const proxyResponsePromise = parseProxyResponse(socket);
		socket.write(`${payload}\r\n`);
		const {statusCode, buffered} = await proxyResponsePromise;
		if (statusCode === 200) {
			req.once('socket', resume);
			if (opts.secureEndpoint) {
				const servername = opts.servername || opts.host;
				if (!servername) {
					throw new Error('Could not determine "servername"');
				}

				return tls.connect(Object.assign(Object.assign({}, omit(opts, 'host', 'hostname', 'path', 'port')), {
					socket,
					servername
				}));
			}
			return socket;
		}

		socket.destroy();
		const fakeSocket = new net.Socket();
		fakeSocket.readable = true;
		req.once('socket', (s) => {
			assert(s.listenerCount('data') > 0);
			s.push(buffered);
			s.push(null);
		});
		return fakeSocket;
	}
}

function resume(socket) {
	socket.emit('connect');
	socket.resume();
}

function isDefaultPort(port, secure) {
	return Boolean((!secure && port === 80) || (secure && port === 443));
}

function isHTTPS(protocol) {
	return typeof protocol === 'string' ? /^https:?$/i.test(protocol) : false;
}

function omit(obj, ...keys) {
	const ret = {};
	let key;
	for (key in obj) {
		if (!keys.includes(key)) {
			ret[key] = obj[key];
		}
	}
	return ret;
}

export default HttpsProxyAgent;
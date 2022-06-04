const { require } = window
const net = require("net")
const tls = require("tls")
const url = require("url")
const Buffer = require('buffer').Buffer
import * as agent_base from 'agent-base'

function isHTTPS(protocol) {
	return typeof protocol === 'string' ? /^https:?$/i.test(protocol) : false;
}

class HttpProxyAgent extends agent_base.Agent {
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
		if (proxy.host && proxy.path) {
			delete proxy.path;
			delete proxy.pathname;
		}
		this.proxy = proxy;
	}
	
	async callback(req, opts) {
		const {proxy, secureProxy} = this;
		const parsed = url.parse(req.path);
		if (!parsed.protocol) {
			parsed.protocol = 'http:';
		}
		if (!parsed.hostname) {
			parsed.hostname = opts.hostname || opts.host || null;
		}
		if (parsed.port == null && typeof opts.port) {
			parsed.port = String(opts.port);
		}
		if (parsed.port === '80') {
			delete parsed.port;
		}
		req.path = url.format(parsed);
		if (proxy.auth) {
			req.setHeader('Proxy-Authorization', `Basic ${Buffer.from(proxy.auth).toString('base64')}`);
		}
		let socket;
		if (secureProxy) {
			socket = tls.connect(proxy);
		} else {
			socket = net.connect(proxy);
		}
		req.once("socket", (s) => {s.emit("connect")})
		if (req._header) {
			let first;
			let endOfHeaders;
			req._header = null;
			req._implicitHeader();
			if (req.output && req.output.length > 0) {
				first = req.output[0];
				endOfHeaders = first.indexOf('\r\n\r\n') + 4;
				req.output[0] = req._header + first.substring(endOfHeaders);
			} else if (req.outputData && req.outputData.length > 0) {
				first = req.outputData[0].data;
				endOfHeaders = first.indexOf('\r\n\r\n') + 4;
				req.outputData[0].data =
					req._header + first.substring(endOfHeaders);
			}
		}
		return socket;
	}
}

export default HttpProxyAgent;
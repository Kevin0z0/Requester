const {require, process: {hrtime}, process} = window
const http   = require("http")
const https  = require('https')
const Buffer = require('buffer').Buffer
const {stringify} = require('querystring')
const {createReadStream, ReadStream} = require("fs")
import Agent from './agent'
import utils from './_utils'
import decode from './_decode'
import Auth from './authorization'
import * as mime from 'mime-types'
import { v4 as uuidv4 } from 'uuid'
import {parse as urlParse} from 'url'
import CookieJar from "@/utils/cookieJar"
import RequestFile from "@/utils/file/RequestFile"

const MS_PER_NS  = 1e6
const NS_PER_SEC = 1e9
const IS_URL = /^(https?:)?\/\//
const METHODS = function (i){
	return {
		set: (key, value) => {
			if (this.config[i]) {
				const item = this.config[i]
				if(!item[key]){
					item[key] = value
				}
				else if (item[key].constructor === Array) {
					item[key].push(value)
				}
				else if (item[key]) {
					item[key] = [item[key], value]
				}
			}
			else
				this.config[i] = { [key]: value }
		},
		get: (key) => {
			return this.config[i] && this.config[i][key]
		},
		getAll: () => {
			return this.config[i]
		},
		del: key => {
			if (key in this.config[i]) delete this.config[i][key]
		}
	}
}



function _isRedirect(redirect){
	if(redirect === undefined) return true
	if(redirect instanceof Boolean) return redirect
	if(redirect instanceof Object) {
		if(redirect.follow === undefined) return true
		return redirect.follow
	}
}

function getHrTimeDurationInMs (startTime, endTime) {
	const secondDiff = endTime[0] - startTime[0]
	const nanoSecondDiff = endTime[1] - startTime[1]
	const diffInNanoSecond = secondDiff * NS_PER_SEC + nanoSecondDiff
	return diffInNanoSecond / MS_PER_NS
}

class RequestMethods{
	#request = Promise

	constructor(promise) {
		this.#request = promise
	}

	byte(func){
		return this.#request.then(v=>v.data).then(func)
		// return this
	}

	catch(func){
		return new RequestMethods(this.#request.catch(v=>{
			return func && func({
				data: null,
				error: v.error,
				timings: null
			})
		}))
	}

	then(func){
		return this.#request.then(v=>{
			const str = v?.data?.data
			if (func)
				return str ? func({...v.data, data: str.toString()}) : func(v.data)
		})
	}

	json(func){
		this.#request.then(v=>v.data).then(v=>{
			v.data = JSON.parse(v.data)
			return v
		}).catch(()=>{return {error: "This content cannot be parsed."}}).then(func)
		return this
	}

	time(func){
		this.#request.then(v => {
			const eventTimes = v.timings
			return {
				dnsLookup: eventTimes.dnsLookupAt !== undefined ?
					getHrTimeDurationInMs(eventTimes.startAt, eventTimes.dnsLookupAt) : undefined,
				tcpConnection: getHrTimeDurationInMs(eventTimes.dnsLookupAt || eventTimes.startAt, eventTimes.tcpConnectionAt),
				tlsHandshake: eventTimes.tlsHandshakeAt !== undefined ?
					(getHrTimeDurationInMs(eventTimes.tcpConnectionAt, eventTimes.tlsHandshakeAt)) : undefined,
				firstByte: getHrTimeDurationInMs((eventTimes.tlsHandshakeAt || eventTimes.tcpConnectionAt), eventTimes.firstByteAt),
				contentTransfer: getHrTimeDurationInMs(eventTimes.firstByteAt, eventTimes.endAt),
				total: getHrTimeDurationInMs(eventTimes.startAt, eventTimes.endAt)
			}
		}).then(func)
		return this
	}
}

class Requester{
	_baseHeader = {
		// TODO
		// 'Accept-Encoding': 'gzip, deflate, br',
		// 'Cache-Control': 'no-cache'
	}
	constructor() {
		this.params = METHODS.call(this, 'params')
		this.headers = METHODS.call(this, 'headers')
		this.data = METHODS.call(this, 'data')
	}

	_urlParser() {
		if(this.url.startsWith('//')){
			this.url = (this.info?.protocol ? this.info.protocol + ":" : 'http:') + this.url
		} else if (!this.url.startsWith('http')) this.url = 'http://' + this.url
		const data = urlParse(this.url)
		data.protocol = data.protocol?.slice(0, data.protocol.length - 1)
		// this._baseHeader.Host = data.host
		if (!data.port) {
			data.port = (data.protocol === 'http') ? 80 : 443
		}
		return data
	}

	_setPath(dist, path) {
		const query = this.info.query
		if (query || this.config.params) {
			let temp = `?${query ? query + '&' : ''}${stringify(this.config.params)}`
			if(dist) dist[path] = "/" + temp
			else this.options.path += temp
		}
	}

	_proxyBypass(urls){
		for(let i of urls){
			if(!i) break
			// if(i.indexOf('*') > -1){
			const regex = new RegExp(i)
			if(regex.test(this.options.hostname)){
				return true
			}
			// }else if(i === this.options.hostname){
			// 	return true
			// }
		}
		return false
	}

	_setProxy() {
		const proxy = this.config.proxy
		const protocol = this.info.protocol
		if (!proxy ||
			!Object.keys(proxy).length ||
			!(protocol in proxy) ||
			this._proxyBypass(proxy.bypass)
		) return

		if (protocol in proxy && !proxy[protocol].startsWith('http')) {
			proxy[protocol] = `http://${proxy[protocol]}`
		}

		const auth = proxy.auth ? `${proxy.auth.username}:${proxy.auth.password}` : null

		const opts = {
			...urlParse(proxy[protocol]),
			timeout: this.options.timeout,
			auth: auth
		}
		this.options.agent = Agent(protocol, opts)
	}

	_setTimeout() {
		this.config.timeout && (this.options.timeout = this.config.timeout)
	}

	_setHeader(){
		!this.config.headers && (this.config.headers = {})
		const headers = this.config.headers
		if(headers["Host"] !== false){
			if(headers["Host"] && headers["Host"].constructor === Array){
				if(headers["Host"][0]){
					headers["Host"] = headers["Host"][1]
				}
			}else{
				headers["Host"] = this.info.host
			}
		}
		for(let i in this._baseHeader){
			if(!headers[i]) headers[i] = this._baseHeader[i]
		}
		/**
		 * TODO: merge cookies
		 */
		const cookies = this.cookieJar.getCookies(this.info.host, this.info.pathname)
		if(cookies) headers['Cookie'] = cookies
		// Sometimes js? webpack? will add "": "" to headers automatically, fuck
		for(let i of Object.keys(headers)){
			if(!i) delete headers[i]
		}
		this._setToken()
	}

	_handler(url, method, config){
		this.timings = {
			startAt: hrtime(),
			dnsLookupAt: undefined,
			tcpConnectionAt: undefined,
			tlsHandshakeAt: undefined,
			firstByteAt: undefined,
			endAt: undefined
		}
		this.url = url
		this.config = config
		this.info = this._urlParser()
		this.method = method ? method.toUpperCase() : 'GET'
		return this._setBody(this.config.type, this.config.data)
			.then(data => this._setAuth(data))
			.then(data => {
				this._setHeader()
				let setHost = true
				if(this.config.headers.Host === false){
					setHost = false
					delete this.config.headers.Host
				}
				this.options = {
					hostname: this.info.host.split(":")[0],
					port: this.info.port,
					headers: {...this.config.headers},
					path: this.info.pathname,
					method: this.method,
					setHost,
					rejectUnauthorized: this.verify
				}
				console.log(this.options)
				this._setPath()
				this._setTimeout()
				this._setProxy()
				return this._send(data)
			})
	}

	_send(data) {
		let chunks = []
		const baseHTTP = this.info.protocol === 'http' ? http : https
		return new Promise((resolve, reject) => {
			this.sender = baseHTTP.request(this.options, (res) => {
				res.once('readable', () => {
					this.timings.firstByteAt = hrtime()
				})

				res.on('data', (chunk) => {
					if (chunk) chunks.push(chunk)
				})

				res.once('end', () => {
					res.removeAllListeners()
					this.timings.endAt = hrtime()
					resolve({
						raw: res,
						status_code: res.statusCode,
						headers: res.headers,
						data: Buffer.concat(chunks)
					})
				})
			})

			this._setTime()
			this.sender.once('abort', ()=>{
				this.sender.removeAllListeners()
				this.config.abort && this.config.abort()
				reject({error: "aborted"})
			})

			this.sender.once('error', e => {
				this.sender.removeAllListeners()
				reject({error: e.toString()})
			})

			this.sender.once('timeout', () => {
				this.sender.abort()
				this.sender.removeAllListeners()
				reject({error: "Response timed out"})
			})

			process.once('unhandledRejection', (reason, p) => {
				this.sender.removeAllListeners()
				reject({error: `Promise: ${p}, Reason: ${reason}`})
			})
			this._write(data)
		})
	}

	abort (){
		this.sender && this.sender.abort()
	}

	async _redirect(url, method, config){
		const isRedirect = _isRedirect(config.redirect)
		this.cookieJar = new CookieJar()
		let status = await this._handler(url, method, config)
		if(isRedirect) {
			let max = Math.max(0,this.config.redirect?.maxRedirect || 20)
			while(max--){
				this.cookieJar.setCookies(status?.headers["set-cookie"], status.raw.req.host)
				const code = status.status_code
				if(code > 300 && code < 400){
					if(!IS_URL.test(status.headers.location)) {
						this.url = this.url.replace(this._urlParser(this.url).path, status.headers.location)
					}else{
						this.url = status.headers.location
					}
					if(this.config.redirect?.inherit){
						// The url path has been changed, so delete params
						delete this.config.params
						this.config.redirect.removeReferer && delete this.config.headers?.Referer
						status = await this._handler(
							this.url,
							this.config.redirect?.followMethod ? method : "GET",
							this.config)
					}else {
						status = await this._handler(this.url, 'GET', {
							timeout: config.timeout,
							proxy: config.proxy
						})
					}
				}else{
					break
				}
			}
			if(max === 0) {
				return new Promise((_,rej)=>{
					rej({
						data: null,
						timings: null,
						error: 'Exceeded maxRedirects. Probably stuck in a redirect loop ' + url
					})
				})
			}
		}
		decode(status)
		status.cookies = this.cookieJar
		return {
			data: status,
			timings: this.timings,
			error: null
		}
	}

	request(url, method, config){
		this.verify = config.verify !== false
		const pending = this._redirect(url, method, config)
		return new RequestMethods(pending)
	}

	get(url, config){
		return this.request(url, 'GET', config)
	}

	post(url, config){
		return this.request(url, 'POST', config)
	}

	put(url, config){
		return this.request(url, 'put', config)
	}

	async _setBody(type, content) {
		if(!content || content === 'none') return null
		if (!type || type === 'x-www-form-urlencoded') {
			/**
			 * TODO add DO NOT ESCAPE option
			 */
			content = stringify(content)
			this.headers.set('Content-type', 'application/x-www-form-urlencoded')
			this.headers.set('Content-length', content.length)
			return content || null
		}
		if (type === 'form-data') {
			const form = new utils.FormData()
			for (let i in content) {
				let stream = content[i]
				if (stream.file && stream.file.path) {
					stream = createReadStream(stream.file.path)
				}
				form.append(i, stream)
			}
			return new Promise(resolve => {
				form.getLength((err, length) => {
					this.headers.set('Content-type', form.getHeaders()['content-type'])
					this.headers.set('Content-length', length)
					resolve(form)
				})
			})
		}

		if (type === 'raw') {
			content = Buffer.from((content instanceof Object) ? JSON.stringify(content) : content.toString(), 'utf-8')
			this.headers.set('Content-length', content.length)
			this.headers.set('Content-type', utils.RAW_HEADER[this.config.dataType])
			return content || null
		}

		if (type === 'binary') {
			if (!content || !(content instanceof File) &&
				content.constructor !== RequestFile ||
				!content.hasFile()) return null
			const file = utils.createReadStream(content.path)
			this.headers.set('Content-type', mime.lookup(content.path) || "application/octet-stream")
			this.headers.set('Content-length', content.size)
			return file
		}
	}
	_write(data) {
		if(!data) return this.sender.end()
		if (data instanceof utils.FormData) {
			data.getLength(() => {
				data.pipe(this.sender)
			})
		} else if (data instanceof ReadStream) {
			data.pipe(this.sender)
		} else {
			this.sender.write(data)
			console.log(data)
			this.sender.end()
		}
	}

	_setToken(){
		const headers = this.config.headers
		const hash = uuidv4()
		if(headers["Requester-Token"] && headers["Requester-Token"].constructor === Array){
			headers["Requester-Token"][0] = hash
		}else if(headers["Requester-Token"] !== false){
			headers["Requester-Token"] = hash
		}
	}

	_setTime() {
		this.sender.once('socket', (socket) => {
			socket.once('lookup', () => {
				this.timings.dnsLookupAt = hrtime()
			})
			socket.once('connect', () => {
				this.timings.tcpConnectionAt = hrtime()
			})
			socket.once('secureConnect', () => {
				this.timings.tlsHandshakeAt = hrtime()
			})
		})
	}

	async _setAuth (data){
		const auth = this.config.auth
		if(auth){
			await new Promise(res => {
				Auth[auth.type].call(this, auth, data, res)
			})
		}
		return data
	}
}

if (require.main === module) {
	const requester = new Requester("http://127.0.0.1", {
		params: {
			a: '111'
		}
	})

	requester.params.add("abc", 111)
	console.log(requester.params.get("abc"))
}

export default () => {return new Requester()}
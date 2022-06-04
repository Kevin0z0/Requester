import {getServer, isObject} from "@/utils/functions";
import userData from "@/store/global/user";
const jwt = window.require('jsonwebtoken')
import {EventEmitter} from 'events'
const tempMap = new Map()
import shortid from 'shortid'

class JsonWebsocket extends WebSocket{
	eventListener = new EventEmitter()
	constructor() {
		const user = userData.state
		arguments[0] = getServer().replace('http', 'ws') +
			arguments[0] +
			"?auth=" +
			jwt.sign(
				{ session:localStorage.getItem('session') },
				user.privateKey,
				{ algorithm: 'RS256' }
			)
		// console.log(arguments[0])
		super(...arguments);
		this.onmessage((event)=>{
			const data = JSON.parse(event.data)
			const symbol = data.symbol
			delete data.symbol
			this.eventListener.emit(symbol, data)
		})
	}

	send(content){
		const symbol = shortid.generate()
		if(!isObject(content)){
			content = {
				message: content
			}
		}
		content.symbol = symbol
		super.send(JSON.stringify(content))
		return new Promise((resolve) => {
			this.eventListener.once(symbol, (data)=>{
				resolve(data.message)
			})
		})
	}

	onConnect(callback){
		this.addEventListener('open', callback, { once: true })
	}

	_clearStatus(){
		for(const i of tempMap.values()){
			this.removeEventListener('message', i)
		}
	}

	onError(callback){
		this.addEventListener('error', ()=>{
			this._clearStatus()
			callback()
		}, {once: true})
	}

	onClose(callback){
		this.addEventListener('close', ()=>{
			this._clearStatus()
			callback()
		}, { once: true })
	}

	onMessage(callback){
		const symbol = Symbol()
		const func = (event)=>{
			const info = {
				data: JSON.parse(event.data)
			}
			callback(info)
			this.removeEventListener('message', tempMap.get(symbol))
		}
		tempMap.set(symbol, func)
		this.addEventListener('message', func, {once: true})
	}

	onmessage(callback){
		this.addEventListener('message', callback)
	}
}

export default JsonWebsocket
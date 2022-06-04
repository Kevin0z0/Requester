const { require } = window
const rawCrypto = require('crypto')
import {sha512_256} from 'js-sha512'
import {TYPE} from '../_utils'

//Reference from postman-runtime
class Crypto{
	_hash = sha512_256.create()
	update (data) {
		this._hash.update(data)
		return this
	}
	digest () {
		return this._hash["hex"]()
	}
}

const crypto = {
	createHash: function (algo) {
		if (algo === 'sha-512-256')
			return new Crypto()
		return rawCrypto.createHash(algo)
	}
}

function cryptoMethod(method, content){
	return crypto.createHash(method).update(content).digest("hex")
}

function computeBodyHash(request, stream, algo, callback){
	const hash = crypto.createHash(algo)
	if(!stream) {
		callback(hash.digest('hex'))
	}
	else if(request.config.type === TYPE.UrlEncoded || request.config.type === TYPE.Raw){
		callback(hash.update(stream).digest('hex'))
	}
	else if(request.config.type === TYPE.Binary || request.config.type === TYPE.FormData){
stream.getClonedStream(clone=>{
	clone.on('data', chunk=>{
		hash.update(chunk)
	})
	clone.once('end', ()=>{
		callback(hash.digest('hex'))
	})
})
	}
}

function toHeader(auth){
	let str = ["Digest"]
	for(let i in auth){
		str.push(`${i}="${auth[i]}"`)
	}
	return str.join(" ")
}

function DigestAuth(options, body, done){
	if(!options.username) return done()
	!options.realm && (options.realm = "")
	!options.nonce && (options.nonce = "")
	!options.password && (options.password = "")
	const temp = {
		username: options.username,
		realm: options.realm,
		nonce: options.nonce,
		algorithm: options.algorithm.toUpperCase() || "MD5",
		uri: '/'
	}
	this["_setPath"](temp, 'uri')
	if(options.qop && ["auth", "auth-int"].includes(options.qop.qop)){
		if(!options.qop.cnonce) options.qop.cnonce = ""
		temp.qop = options.qop.qop
		temp.cnonce = options.qop.cnonce
		options.qop.nc ? temp.nc = options.qop.nc : options.qop.nc = ""
	}
	options.opaque && (temp.opaque = options.opaque)
	const algo = temp.algorithm.replace(/-sess/i, '').toLowerCase()
	let HA1 = cryptoMethod(algo, `${options.username}:${options.realm}:${options.password}`)
	if(temp.algorithm.includes('sess')) {
		HA1 = cryptoMethod(algo, `${HA1}:${temp.nonce}:${temp.cnonce}`)
	}
	if(temp.qop !== 'auth-int'){
		let HA2 = cryptoMethod(algo, `${this["method"]}:${temp.uri}`)
		if(temp.qop === 'auth')
			temp.response = cryptoMethod(algo, `${HA1}:${temp.nonce}:${options.qop.nc}:${temp.cnonce}:${temp.qop}:${HA2}`)
		else
			temp.response = cryptoMethod(algo, `${HA1}:${temp.nonce}:${HA2}`)
		this["headers"].set('Authorization', toHeader(temp))
		done()
	}else{
		computeBodyHash(this, body, algo, hash => {
			let HA2 = cryptoMethod(algo, `${this["method"]}:${temp.uri}:${hash}`)
			temp.response = cryptoMethod(algo, `${HA1}:${temp.nonce}:${options.qop.nc}:${temp.cnonce}:${temp.qop}:${HA2}`)
			this["headers"].set('Authorization', toHeader(temp))
			done()
		})
	}
}

export default DigestAuth
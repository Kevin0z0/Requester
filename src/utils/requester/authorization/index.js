const { require } = window
// eslint-disable-next-line no-unused-vars
const Buffer = require('buffer').Buffer
import DigestAuth from "./digest";

/**
 * Api Key
 * @param options
 * @param data
 * @param done
 * @returns {Promise}
 * @constructor
 */
function ApiKey(options, data, done){
	if(!options) return done()
	this[options.addTo.toLowerCase() === 'header' ?
		'headers' :
		'params']
		.set(options.key, options.value)
	done()
}

function BearerToken(options, data, done){
	if(!options.token) return done()
	this["headers"].set("Authorization", `Bearer ${options.token}`)
	done()
}

function BasicAuth(options, data, done){
	if(!options.username || !options.password) return done()
	const b64 = Buffer.from(`${options.username}:${options.password}`)
	this["headers"].set("Authorization", `Basic ${b64.toString('base64')}`)
	done()
}

const Auth = {
	"api-key": ApiKey,
	"bearer": BearerToken,
	"basic": BasicAuth,
	"digest": DigestAuth,
}

// console.log(Auth['digest']({
// 	username: 'Mufasa',
// 	password: 'Circle Of Life',
// 	realm: "testrealm@host.com",
// 	nonce: "dcd98b7102dd2f0e8b11d0f600bfb0c093",
// 	uri: "/dir/index.html",
// 	qop:{
// 		qop: "auth",
// 		nc: "00000001",
// 		cnonce: "0a4f113b"
// 	},
// 	opaque: "5ccc069c403ebaf9f0171e9517f40e41",
// 	method: 'GET',
// 	algorithm: "sha256-sess"
// }))

export default Auth
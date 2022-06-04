const { require } = window
const zlib = require('zlib')
const Buffer = require('buffer').Buffer

const gzip = (response) =>{
	const buffer = zlib.unzipSync(response.data)
	response.data = Buffer.from(buffer)
}

const br = (response) => {
	const buffer = zlib.brotliDecompressSync(response.data)
	response.data = Buffer.from(buffer)
}

export default (response) => {
	const method = response.headers['content-encoding']
	if(!response.data || !method) return
	if(method === 'gzip' || method === 'deflate'){
		return gzip(response)
	}
	if(method === 'br'){
		return br(response)
	}
	console.error("ERROR: The method is not supported yet")
}
const {require} = window
const Form = require('form-data')
const { createReadStream, ReadStream } = require("fs");
import * as CombinedStream from 'combined-stream'
import {EventEmitter} from 'events'
import * as util from 'util'

class CloneStream extends EventEmitter{
	writable = true
	write(chunk){
		this.emit('data',chunk)
	}
	end(){
		this.emit('end')
	}
}


class FormData extends Form{
	_clonedStream = []
	append(field, value, options) {
		options = options || {};
		if (typeof options == 'string') {
			options = {filename: options};
		}

		const append = CombinedStream.prototype.append.bind(this);
		if (typeof value == 'number') {
			value = '' + value;
		}
		if (util.isArray(value)) {
			this._error(new Error('Arrays are not supported.'));
			return;
		}

		const header = this._multiPartHeader(field, value, options);
		const footer = this._multiPartFooter();
		append(header);
		append(value);
		append(footer);
		this._clonedStream.push({
			key: field,
			value: value
		})
		this._trackLength(header, value, options);
	}

	getClonedStream(callback){
		const form = new FormData()
		form.setBoundary(this.getBoundary())
		for(let i = 0; i < this._clonedStream.length; i++){
			const temp = this._clonedStream[i]
			let stream = temp.value
			if(stream instanceof ReadStream) {
				stream = createReadStream(temp.value.path)
			}
			form.append(temp.key, stream)
		}
		const cloneStream = new CloneStream()
		callback(cloneStream)
		form.pipe(cloneStream)
	}
	setBoundary(boundary){
		this["_boundary"] = boundary
	}
}

class CreateReadStream extends ReadStream{
	constructor(path) {
		super(path);
	}
	getClonedStream(callback){
		const stream = new CloneStream()
		callback(stream)
		createReadStream(this.path).pipe(stream)
	}
}

export const TYPE = {
	FormData: 'form-data',
	Raw: 'raw',
	Binary: 'binary',
	UrlEncoded: 'x-www-form-urlencoded'
}

export default {
	FormData,
	createReadStream(path){
		return new CreateReadStream(path)
	},
	RAW_HEADER: {
		text: "text/plain",
		json: "application/json",
		html: "text/html",
		xml: "application/xml",
		javascript: "application/javascript"
	}
}
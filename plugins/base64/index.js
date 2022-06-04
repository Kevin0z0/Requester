function stringToBase64(){
	this.selection.replace(new Buffer(this.selection.text).toString('base64'))
}

function base64ToString() {
	this.selection.replace(new Buffer(this.selection.text, 'base64').toString())
}

module.exports = {
	stringToBase64,
	base64ToString
}
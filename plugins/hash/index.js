const crypto = require("crypto")
function md5(){
	this.selection.replace(crypto.createHash('md5').update(this.selection.text).digest('hex'))
}

module.exports = {
	md5
}
function _parse(item){
	const index = item.indexOf("=")
	if(index > -1) return [item.slice(0, index), item.slice(index + 1)]
	return [item, true]
}

function parser(cookie, domain){
	const items = cookie.split(';')
	const obj = {};
	const temp = _parse(items[0].trim())
	obj['name'] = temp[0]
	obj['value'] = temp[1]
	for(let i = 1; i < items.length; i++){
		const temp = _parse(items[i].trim())
		obj[temp[0].toLowerCase()] = temp[1]
	}
	obj["secure"] = !!obj.secure
	obj["httponly"] = !!obj.httponly
	!obj["domain"] && (obj["domain"] = domain)
	!obj["expires"] && (obj["expires"] = "Session")
	return obj
}

// module.exports = parser
export default parser
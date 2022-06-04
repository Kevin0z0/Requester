import store from "@/store";
import requests from "@/store/requests";
// eslint-disable-next-line no-unused-vars
import {deepClone, isArray, isObject, isStr} from "@/utils/functions";

function _regexp(value, env){
	const arr = [...value.matchAll(/{{\s*?(.*?)\s*?}}/g)].map(v=>v[1])
	if(!arr.length) return value
	for(const item of env){
		if(arr.includes(item[0])){
			const regex = new RegExp("\\{\\{\\s*?" + item[0] + "\\s*?\\}\\}", 'g')
			value = value.replace(regex, item[2])
		}
	}
	return value
}

function _dfs(value, env){
	for(const i in value){
		const temp = value[i]
		if(isStr(temp)) {
			value[i] = _regexp(temp, env)
		}
		else if(isObject(temp)){
			_dfs(temp, env)
		}
	}
}

export async function replace(value, placeholder){
	value = deepClone(value)
	const envID = requests.state.value.info.environment
	if(!envID) return value
	const env = await store.dispatch("environment/getContent", envID)
	if(!env) return value
	if(isArray(value)){
		if(isArray(placeholder)){
			for(const index in value){
				const item = value[index]
				if(isArray(item)){
					for(const i in placeholder){
						const temp = placeholder[i]
						const val = item[i]
						if(temp && val.constructor === temp){
							item[i] = _regexp(val, env)
						}
					}
				}
			}
		}
	}else if(isObject(value)){
		_dfs(value, env)
	}else if(isStr(value)){
		return _regexp(value, env)
	}
	return value
}
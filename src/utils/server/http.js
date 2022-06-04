import http from '../requester'
import {getServer} from "@/utils/functions";

export default function (host, method, extra={}){
	if(!extra.headers){
		const session = localStorage.getItem('session')
		if(session)
			extra.headers = {
				"Cookie": session
			}
	}
	if(method === 'POST' && !extra.type){
		extra.type = 'raw'
		extra.dataType = 'json'
	}
	console.log(extra)
	const request = http().request(getServer(host), method, extra)
	return new Promise((resolve, reject) => {
		request.catch((v)=>{
			reject(v)
		}).json(v=>{
			try{
				const data = v.data
				if(data.error) return reject(data.error)
				if(v.data.code === 0) return reject(data.message)
				console.log(v)
				resolve(v)
			}catch (e){
				reject({
					error: e.toString()
				})
			}
		})
	})
}
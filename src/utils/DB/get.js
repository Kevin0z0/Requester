import DB from './index'
import store from "@/store";
import http from "@/utils/server/http";


export function getRequest(rid, showIndex){
	if(window.online){
		return http('/api/v1/request/get', "POST", {
			data:{
				id: rid,
				showIndex: showIndex
			}
		}).then(v=>{
			return v.data.message
		})
	}
	const list = [
		DB.get("SELECT * FROM request WHERE id = ?",[rid]),
		DB.get("SELECT pid, value FROM request_params WHERE rid = ?",[rid]),
		DB.all("SELECT bid, type, value FROM request_body WHERE rid = ?",[rid]),
		DB.get("SELECT hid, value, defaultValue FROM request_headers WHERE rid = ?",[rid]),
		DB.all("SELECT aid, type, value FROM request_auth WHERE rid = ?",[rid]),
		DB.get("SELECT sid, value FROM request_settings WHERE rid = ?",[rid]),
		DB.get("SELECT tid, pretest, test FROM request_test WHERE rid = ?",[rid]),
	]
	const query = "SELECT id, showIndex, name, url, requestMethod, star, father_id FROM request WHERE showIndex"
	if(showIndex === true) list.push(DB.all( query + " IS NOT NULL order by showIndex DESC"))
	else if(showIndex && showIndex.constructor === Number) list.push(DB.get(query + " = ?", showIndex))
	return Promise.all(list).then(v=>{
		console.log(v)
		return v
	})
}

export async function getEnvironmentValue(eid){
	let data
	if(window.online){
		data = (await http("/api/v1/environment/getvalue", "POST", {
			data: {
				id: eid
			}
		}))
		data = data.data.message
	}else {
		data = await DB.get("SELECT value FROM environment WHERE id = ?", [eid])
	}
	if(data)
		return JSON.parse(data.value)
	return null
}

export async function getEnvironment(eid){
	if(window.online){
		return (await http("/api/v1/environment/get", "POST", {
			data: {
				id: eid
			}
		})).data.message
	}
	return await DB.get("SELECT name, creator, createtime FROM environment WHERE id = ?", [ eid ])
}

export async function getCollectionItems(id, first=true, arr = []){
	if(window.online){
		if(first)
			arr = (await http("/api/v1/collection/get", "POST", {
				data:{
					id
				}
			})).data.message
		for(const v of arr){
			if(v.expand){
				await getCollectionItems(v.cid, false, v.children)
			}
		}
		for(const i in arr){
			if(arr[i].isFolder) continue
			const item = arr[i]
			const value = await store.dispatch('requests/hasRequest', item.id)
			if(value){
				arr[i] = value.info
			}else{
				store.state.requests.tempList.set(item.id, {info: item, notFull: true})
			}
		}
	}else{
		const value = await DB.all(`SELECT cid, name, expand FROM collections WHERE father_id = ? ${first ? 'AND cid > 0' : ''}`, [id])
		for(const v of value){
			const obj = {
				name: v.name,
				id: v.cid,
				isFolder: true,
				expand: !!v.expand,
				father_id: id,
				hasValue: false
			}
			if(v.expand){
				obj.children = await getCollectionItems(v.cid, false)
				obj.hasValue = true
			}
			arr.push(obj)
		}
		const request = await DB.all("SELECT id, name, url FROM request WHERE father_id = ?", [id])
		for(const v of request){
			const value = await store.dispatch('requests/hasRequest', v.id)
			if(value){
				arr.push(value.info)
			}else{
				store.state.requests.tempList.set(v.id, {info: v, notFull: true})
				arr.push(v)
			}
		}
	}
	return arr
}
import DB from './index'
import store from "@/store";
import http from "@/utils/server/http";
import db from "./index";
const requests = store.state.requests
const env = store.state.environment
const list = requests.activeList
const temp = requests.tempList
const user = store.state.user

export async function deleteRequest (id, deleteInDB = true){
	let result
	if(deleteInDB) {
		if(!window.online)
			result = await DB.run("DELETE FROM request WHERE id = ?", id)
		else{
			result = (await http("/api/v1/request/delete", "POST",{
				data: {
					id
				}
			})).data.message
		}
	}
	return new Promise((resolve, reject) => {
		if(deleteInDB){
			if(!result.changes) return reject("Request delete failed")
			requests.currentRid = -1
		}
		for(const i of Object.keys(list)){
			if(list[i].id === id){
				delete list[i]
				break
			}
		}
		const currentList = Object.keys(list)
		if(!currentList.length){
			requests.currentRid = 0
			return db.update("user", {
				currentRid: null
			}, {
				uid: user.uid
			}).then(()=>{
				resolve(false)
			})
		}
		store.dispatch(
			"requests/setRequest",
			list[currentList[currentList.length - 1]].id,
		).then(()=>{
			if(deleteInDB) temp.delete(id)
			resolve(true)
		})
	})
}

export async function deleteEnv(id){
	let result
	if(window.online){
		result = (await http('/api/v1/environment/delete', "POST", {
			data:{
				id
			}
		})).data.message
	}else{
		result = await DB.run("DELETE FROM environment WHERE id = ?", [id])
	}
	DB.update("request", {
		environment: null
	}, {
		environment: id
	})
	return new Promise((resolve, reject) => {
		if(!result.changes) reject()
		env.envList.delete(id)
		env.envContentList.delete(id)
		if(env.currentEnvID === id){
			const status = env.envList.entries().next()
			if(!status.done) env.currentEnvID = status.value[0]
			else{
				env.currentEnvID = null
			}
		}
		if(requests.value.info.environment === id) requests.value.info.environment = 0
		resolve(env.currentEnvID)
	})
}

async function _removeFatherID(id){
	const target = await store.getters['requests/getById'](id)
	if(!target.notFull) {
		target.info.father_id = null
	}
	store.commit('requests/modifyActiveListItem', {
		path: 'father_id',
		id: id,
		value: null
	})
}

export async function deleteCollection(id){
	// DB.run("DELETE FROM collections WHERE cid = ?", [id])

	if(window.online){
		const data = (await http("/api/v1/collection/delete", "POST", {
			data: {
				id
			}
		})).data.message
		if(data.activeList.length){
			for(const i of data.activeList){
				if(await store.dispatch('requests/activeListHasValue', i)){
					_removeFatherID(i)
				}
			}
		}
		return
	}
	const value = await Promise.all([
		DB.all("SELECT cid FROM collections WHERE father_id = ?", [id]),
		DB.all("SELECT id FROM request WHERE father_id = ?", [id])
	])

	for(const i of value[0]){
		await deleteCollection(i.cid)
	}
	for(const i of value[1]){
		const id = i.id
		if(await store.dispatch('requests/activeListHasValue', id)){
			await _removeFatherID(id)
			DB.update("request", {
				father_id: null
			}, {
				id: id
			})
		}else{
			DB.run("DELETE FROM request WHERE id = ?", [id])
		}
	}
	DB.run("DELETE FROM collections WHERE cid = ?", [id])
}
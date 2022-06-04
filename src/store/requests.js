import db from "@/utils/DB"
import requestFile from "@/utils/file";
import {getRequest} from "@/utils/DB/get";
import user from "@/store/global/user";
// import {deepClone} from "@/utils/functions";

const arrayToObj = arr => arr.reduce((prev, current)=>{
	prev[current.type] = current
	current.value && (current.value = JSON.parse(current.value))
	delete current.type
	return prev
}, {})

function addItem(state, obj, target){
	console.log(obj, target)
	if(!target){
		target = state.value
		state.currentRid = obj.id
	}
	if(obj.notFull){
		target.info = Object.assign(target.info, obj.data[0])
	}else{
		target.info = obj.data[0]
	}
	target.params = obj.data[1]
	target.params.value = JSON.parse(obj.data[1].value)
	console.log(target.params)
	target.body = arrayToObj(obj.data[2])
	target.body['binary'].value.file = requestFile(target.body['binary'].value.file, (e)=>{console.log(e)})

	target.headers = obj.data[3]
	target.headers.value = JSON.parse(obj.data[3].value)

	target.auth = arrayToObj(obj.data[4])

	target.settings = obj.data[5]
	target.settings.value = JSON.parse(target.settings.value)

	target.test = obj.data[6]
	target.test.pretest = target.test.pretest?.toString() || ""
	target.test.test = target.test.test?.toString() || ""
	return target
}

const ITEMS = ['info', 'params', 'body', 'headers', 'auth', 'settings', 'test']

async function addCachedItem(state, obj){
	for(let i in ITEMS){
		const item = ITEMS[i]
		state.value[item] = obj[item]
	}
	if(obj.notFull){
		delete obj.notFull
		const rid = obj.info.id
		addItem(state, {
			id: rid,
			data: await getRequest(rid),
			notFull: true
		})
	}
}

function setCurrentRid(state, rid){
	db.update("user", {
		currentRid: rid
	},{
		uid: state.uid
	})
}

// eslint-disable-next-line no-unused-vars
function setShowIndex(state, rid, index){
	state.activeList[index].showIndex = index
	db.update("request", {
		showIndex: index
	}, {
		id: rid
	})
}

function activeListHasValue(list, rid){
	for(const i in list){
		if(list[i].id === rid) return list[i]
	}
	return false
}

function modifyActiveListItem(state, obj){
	const path = obj.path
	const id = obj.id
	for(const i of ACTIVE_LIST_ITEMS){
		if(i === path){
			const item = activeListHasValue(state.activeList, id)
			console.log(item)
			if(item){
				item[path] = obj.value
			}
			break
		}
	}
}

function hasRequest(state, id){
	if(id === state.currentRid) return state.value
	if(state.tempList.has(id)) return state.tempList.get(id)
	return false
}

const REQUEST_LIST_INDEX = 7
// eslint-disable-next-line no-unused-vars
const ACTIVE_LIST_ITEMS = ['name', 'requestMethod', 'star', 'url', 'father_id']

export default {
	namespaced: true,
	state:{
		value: {
			info: Object,
			params: Object,
			body: Object,
			headers: Array,
			auth: Array,
			settings: {
				sid: null,
				value:{
					sslCert: null,
					followRedirects: null,
					followMethod: null,
					removeReferer: null,
					encodeURL: null,
					disableCookie: null,
					MaxRedirects: null
				}
			},
			test: {
				rid: null,
				pretest: null,
				test: null
			}
		},
		activeList: {},
		activeListMaxIndex: 0,
		currentRid: null,
		tempList: new Map(),
		result: {
			params: null,
			body: null,
			headers: null
		}
	},
	mutations:{
		init(state, obj){
			addItem(state, obj)
			state.activeList = obj.data[REQUEST_LIST_INDEX].reduce((prev, current)=>{
				prev[current.showIndex] = current
				state.activeListMaxIndex = Math.max(state.activeListMaxIndex, current.showIndex)
				delete current.showIndex
				return prev
			}, {})
		},
		setInfo(state, obj){
			if(obj.id && obj.id !== state.currentRid){
				if(state.tempList.has(obj.id))
					state.tempList.get(obj.id).info[obj.path] = obj.value
			}else{
				state.value.info[obj.path] = obj.value
			}
			db.update("request", {
				[obj.path]: obj.value
			},{id: obj.id || state.currentRid})
			modifyActiveListItem(state, obj)
		},
		modifyActiveListItem: modifyActiveListItem,
		addNewRequest(state, obj){
			state.tempList.set(state.currentRid, {...state.value})
			const data = obj.data[REQUEST_LIST_INDEX]
			console.log(data.showIndex, JSON.stringify(data))
			state.activeList[data.showIndex] = data
			delete data.showIndex
			addItem(state, obj)
			setCurrentRid(user.state, state.currentRid)
		},
		setResult(state, obj){
			state.result.body = obj.body || {}
			state.result.params = obj.params || {}
			state.result.headers = obj.headers || {}
		}
	},
	actions:{
		async setRequest({state}, rid){
			if(!rid || rid === state.currentRid) return false
			state.currentRid !== -1 && state.tempList.set(state.currentRid, {...state.value})
			const result = state.tempList.get(rid)
			setCurrentRid(user.state, rid)
			if(result) {
				await addCachedItem(state, result)
				state.currentRid = rid
				state.tempList.delete(rid)
			}else{
				addItem(state, {
					id: rid,
					data: await getRequest(rid)
				})
			}

			if(!activeListHasValue(state.activeList, rid)){
				state.activeList[++state.activeListMaxIndex] = state.value.info
				setShowIndex(state, rid, state.activeListMaxIndex)
			}
		},
		hasRequest({state}, id){
			return hasRequest(state, id)
		},
		activeListHasValue({state}, id){
			return activeListHasValue(state.activeList, id)
		}
	},
	getters:{
		getById: (state) => async (id) => {
			let item = hasRequest(state, id)
			if(item) return item
			item = addItem(state, {
				id: id,
				data: await getRequest(id)
			})
			state.tempList.set(id, {...item})
			return item
		}
	}
}
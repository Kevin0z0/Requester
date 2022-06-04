import store from "@/store";
import DB from "@/utils/DB";
import {getEnvironmentValue, getRequest} from "@/utils/DB/get"
import http from "@/utils/server/http";
import Message from "@/components/Message";
import connection from "@/utils/connection";
import JsonWebsocket from "@/utils/connection/websocket";
import {reload, sleep} from "@/utils/functions";


async function initSettings(){
	if(window.online) return
	store.commit('settings/init',(await DB.getAllFromTable("settings")).reduce((prev, item) => {
		const {groupName, className, name} = item
		if (!prev[groupName]) prev[groupName] = {}
		if (!prev[groupName][className]) prev[groupName][className] = {}
		prev[groupName][className][name] = {
			value: /^[{[]/.test(item.value) ? JSON.parse(item.value) : item.value
		}
		return prev
	}, {}))
}

async function initRequestData(rid){
	return getRequest(rid, true)
}

async function initEnvironmentData(uid){
	let data
	if(window.online){
		data = (await http("/api/v1/environment/all", "POST")).data.message
	}else{
		data = await DB.getAllFromTable("environment", {
			creator: uid
		}, "id, name, creator, createTime")
	}
	const eid = data.at(-1)?.id
	let envContentList
	if(eid){
		envContentList = await getEnvironmentValue(eid)
	}
	store.commit('environment/init', {
		data,
		content: envContentList,
		currentID: eid
	})
}

async function initRequest(){
	let data = store.state.user
	let requestData = {
		id: undefined,
		data: undefined
	}
	if(!window.online){
		data = await DB.get("SELECT currentRid, uid, username FROM user WHERE current = 1")
		store.commit('user/init', data)
		requestData.id = data.currentRid
	}else{
		requestData.id = data.currentRid
	}
	if(data.currentRid){
		requestData.data = await initRequestData(data.currentRid)
		delete data.currentRid
	}
	if(requestData.id){
		store.commit('requests/init', requestData)
	}
	await initEnvironmentData(data.uid)
}

function _defineStatus(target){
	target.onConnect(()=>{
		console.log("websocket connect success")
	})
	target.onError(()=>{
		Message({
			message: "Websocket connection error",
			type: "error"
		})
	})
	target.onClose(async ()=>{
		console.log('websocket hang out, retry connect')
		await sleep(5)
		console.log('websocket connecting...')
		_createSocket()
	})
}

function _createSocket(){
	connection.socket = new JsonWebsocket("/ws/v1/request")
	_defineStatus(connection.socket)
}

async function initUser(){
	const session = localStorage.getItem('session')
	if(session){
		try{
			const data = (await http('/api/v1/user/login', 'POST', {
				headers: {
					"Cookie": session
				}
			})).data
			console.log(data)
			store.commit('user/init', data.data)
			store.commit('settings/init', data.settings)
			_createSocket()
		}catch (e){
			Message({
				message: 'Login failed, switch to local mode',
				type: "error"
			})
			localStorage.removeItem('session')
			reload()
		}
	}
}


function movePlugin(){

}

export default async function (){
	store.commit("plugins/init")
	await initUser()
	await initSettings()
	await initRequest()
	movePlugin()
}

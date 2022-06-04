import db from './index'
import user from '@/store/global/user'
import requests from "@/store/requests";
import {getRequest} from "./get"
import http from "@/utils/server/http";
import {isObject} from "@/utils/functions";

async function insert(table, columns){
	const strArr = []
	let len = columns.length
	while(len--){
		strArr.push('?')
	}
	const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${strArr.join(", ")})`
	const insert = await db.prepare(query);
	return db.transaction((data) => {
		for (const obj of data) insert.run(obj);
	});
}


export async function addRequest(cid){
	// const showIndex = (await db.get("SELECT showIndex from request order by showIndex DESC")).showIndex + 1
	const showIndex = ++requests.state.activeListMaxIndex
	if(window.online){
		return new Promise((resolve, reject) => {
			console.log(showIndex)
			return http("/api/v1/request/create", "POST", {
				data:{
					showIndex,
					father_id: cid
				}
			}).then(v=>{
				const data = v.data.message
				if(data.length && isObject(data[0]) && data[0].id){
					return resolve({
						rid: data[0].id,
						result: data,
						showIndex
					})
				}
				resolve(false)
			}).catch(res=>{
				reject(res)
			})
		})

	}
	const value = await db.run(
		"INSERT INTO request (showIndex, father_id) VALUES ( ?, ? ) ",
		[showIndex, cid]
	)
	if(!value.lastInsertRowid) return false
	const rid = value.lastInsertRowid
	await Promise.all([
		(await insert('request_params', ['rid']))([rid]),
		(await insert('request_body', ['rid', 'type', 'value']))([
			[rid, 'x-www-form-urlencoded', "[]"],
			[rid, 'form-data', "[]"],
			[rid, 'raw', '{"type":"Text","value":""}'],
			[rid, 'binary', '{"file":""}']
		]),
		(await insert('request_headers', ['rid']))([rid]),
		(await insert('request_auth', ['rid', 'type']))([
			[rid, 'basic'],
			[rid, 'bearer'],
			[rid, 'api-key'],
			[rid, 'digest']
		]),
		(await insert('request_test', ['rid']))([rid]),
		(await insert('request_settings', ['rid']))([rid]),
	])
	return {
		rid,
		result: await getRequest(rid, showIndex),
		showIndex
	}

}

export async function addEnvironment(){
	if(window.online){
		return (await http("/api/v1/environment/add", "POST", {
			data: {
				name: "New Environment"
			}
		})).data.message.lastInsertRowid
	}
	const value = await db.run(
		"INSERT INTO environment (name, creator, value) VALUES ( ?, ?, ? ) ",
		['New Environment', user.state.uid, '[]']
	)
	return value.lastInsertRowid
}

export async function addCollection(name, father_id = 0){
	if(window.online){
		return (await http("/api/v1/collection/add", "POST", {
			data: {
				name,
				father_id
			}
		})).data.message.lastInsertRowid
	}
	const value = await db.run(
		"INSERT INTO collections (father_id, name) VALUES ( ?, ? )",
		[father_id, name]
	)
	return value.lastInsertRowid
}



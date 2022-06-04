import {isDev} from "@/utils/functions";
const {require} = window
const {ipcRenderer} = require('electron')
const sqlite = require('better-sqlite3')
import path from 'path'
import connection from "@/utils/connection";

function _objectToArray(obj){
	return Object.keys(obj).reduce((prev, item)=>{
		prev[0].push(`${item} = ?`)
		prev[1].push(obj[item])
		return prev
	},[[],[]])
}

class DB{
	constructor() {
		this._base = ipcRenderer.invoke('read-user-data').then(v=>{
			if(isDev) return sqlite(
				path.join(v, "requester.sqlite"),
				{ verbose: console.log }
			);
			return sqlite(path.join(v, "requester.sqlite"))
		})
	}
	get(statement, args){
		return this.prepare(statement).then(v=>{
			if(args) return v.get(args)
			return v.get()
		})
	}
	all(statement, args){
		return this.prepare(statement).then(v=>{
			if(args) return v.all(args)
			return v.all()
		})
	}
	run(statement, args){
		return this.prepare(statement).then(v=>{
			if(args) return v.run(args)
			return v.run()
		})
	}
	getAllFromTable(table, where, args){
		const whereArg = where && _objectToArray(where)
		args = args ? args : "*"
		if(whereArg)
			return this.all(
				`SELECT ${args} FROM ${table} WHERE ${whereArg[0].join(' AND ')}`,
				whereArg[1]
			)
		return this.all(`SELECT ${args} FROM ${table}`)
	}
	update(table, args, where){
		if(window.online){
			return connection.socket.send({
				method: 'update',
				table,
				args,
				where
			}).then(v=>{
				console.log(v)
				return v
			})
		}
		const updateArg = _objectToArray(args)
		const whereArg = _objectToArray(where)
		const query = `UPDATE ${table} SET ${updateArg[0].join(",")} WHERE ${whereArg[0].join(" AND ")}`
		return this.prepare(query).then(v=>{
			return v.run(updateArg[1], whereArg[1])
		}).then(v=>{
			console.log(v)
			return v
		})
	}
	columns(){
		return this._base.then(v=>{
			return v.columns(...arguments)
		})
	}
	prepare(){
		return this._base.then(v=>{
			return v.prepare(...arguments)
		})
	}
	transaction(){
		return this._base.then(v=>{
			return v.transaction(...arguments)
		})
	}
	pragma(){
		return this._base.then(v=>{
			return v.pragma(...arguments)
		})
	}
	serialize(){
		return this._base.then(v=>{
			return v.serialize(...arguments)
		})
	}
	table(){
		return this._base.then(v=>{
			return v.table(...arguments)
		})
	}
	exec(){
		return this._base.then(v=>{
			return v.exec(...arguments)
		})
	}
	close(){
		return this._base.then(v=>{
			return v.close(...arguments)
		})
	}
}
const db = new DB()

export default db
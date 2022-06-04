import {getEnvironmentValue} from "@/utils/DB/get";

export default {
	namespaced: true,
	state:{
		envList: new Map(),
		envContentList: new Map(),
		currentEnvID: null
	},
	mutations:{
		init(state, obj){
			for(let i of obj.data){
				state.envList.set(i.id, i)
				delete i.id
			}
			state.envContentList.set(obj.currentID, obj.content)
			if(obj.data.length){
				state.currentEnvID = obj.currentID
			}
		},
		// addNewEnv(state, id){
		// 	state.envList.set()
		// }
	},
	actions:{
		async getContent({state}, eid){
			if(!eid === undefined) return false
			let data = state.envContentList.get(eid)
			if(data) return data
			data = await getEnvironmentValue(eid)
			state.envContentList.set(eid, data)
			return data
		}
	}
}
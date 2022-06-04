import {getCollectionItems} from "@/utils/DB/get";

export default {
	namespaced: true,
	state:{
		items: null
	},
	mutations:{

	},
	actions:{
		async init({state}){
			if(!state.items){
				state.items = await getCollectionItems(0)
			}
			return state.items
		}
	}
}
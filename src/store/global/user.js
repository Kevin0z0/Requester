export default {
	namespaced: true,
	state:{
		username: null,
		uid: null,
		email: null,
		profile: null,
		description: null,
		currentRid: null,
		privateKey: null
	},
	mutations:{
		init(state, obj){
			state.username = obj.username
			state.uid = obj.uid
			state.email = obj.email
			state.profile = obj.profile
			state.description = obj.description
			state.currentRid = obj.currentRid
			state.privateKey = obj.privateKey
			if(obj.email) window.online = true
		}
	}
}
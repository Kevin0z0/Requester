export default {
	namespaced: true,
	state:{
		General: {},
		Proxies: {}
	},
	mutations:{
		init(state, obj){
			state.General = obj.General
			state.Proxies = obj.Proxies
		}
	}
}
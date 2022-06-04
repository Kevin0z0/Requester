import {createStore} from 'vuex'
import user from './global/user'
import requests from '@/store/requests'
import settings from './global/settings'
import environment from '@/store/global/environment'
import collections from "@/store/global/collections"
import plugins from "@/store/global/plugins";

export default createStore({
	state: {},
	mutations: {},
	actions: {},
	modules: {
		settings,
		user,
		requests,
		environment,
		collections,
		plugins
	}
})

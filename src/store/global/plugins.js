import {isDev} from "@/utils/functions";

const {require} = window
const path = require('path')
const {ipcRenderer} = require('electron')

export default {
	namespaced: true,
	state:{
		textMenu: []
	},
	mutations: {
		init(state){
			ipcRenderer.invoke('read-user-data').then(v=>{
				const BASE_PATH = isDev ? path.join(__dirname, "../../../../../../plugins/") : path.join(v, 'plugins/')
				const pluginPackage = require(BASE_PATH + "package.json")
				const plugins = pluginPackage.plugins
				for(const i in plugins){
					if(plugins[i].target === 'TextMenu'){
						const pluginPath = BASE_PATH + plugins[i].path
						state.textMenu.push({
							name: i,
							info: plugins[i],
							main: require(pluginPath + require(pluginPath + "package.json").main)
						})
					}
				}
			})
		}
	}
}
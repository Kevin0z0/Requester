import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import './assets/css/auth.css'
import DB from './utils/DB'
import render_preload from "@/render_preload";
import i18n from "./i18n";
const { shell } = window.require('electron');

(async function (){
	String.prototype.format = function() {
		if(!arguments.length) return this;
		for(var s = this, i = 0; i<arguments.length; i++)
			s = s.replace(new RegExp("{}","g"), arguments[i]);
		return s;
	};

	window._open = window.open
	window.open = function (){
		if(arguments[1] === '_blank' && arguments[2] === 'noopener')
			return shell.openExternal(arguments[0])
		window._open(...arguments)
	}


	console.time()
	await render_preload()
	console.timeEnd()

	const app = createApp(App)
	app.config.globalProperties.$db = DB
	app.use(store).use(router).use(i18n).mount('#app')
})()
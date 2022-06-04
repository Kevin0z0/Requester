import {isObject} from "@/utils/functions";

const electron = global.require ? global.require('electron') : require('electron')
const menuMap = new Map()

class ContextMenu {
	constructor(ipcName) {
		this.ipcName = ipcName
		this.watch()
	}

	create(list){
		this.setDefault(list)
		return electron.Menu.buildFromTemplate(list)
	}

	watch(){
		electron.ipcMain.on(this.ipcName, (event, list) => {
			const win = electron.BrowserWindow.fromWebContents(event.sender)
			this.create(list).popup(win)
		})
	}

	setDefault(items){
		for(let item = 0; item < items.length; item++){
			const i = items[item]
			if(i.submenu) {
				this.setDefault(i.submenu)
				continue
			}
			if(!i.role && !i.type && !i.click){
				i.click = (menuItem, win) => {
					win.webContents.send(
						this.ipcName,
						menuItem.scope && {scope: menuItem.scope} ||
						menuItem.name ||
						menuItem.label
					)
				}
			}
		}
	}

	static setLocaleLanguage(){

	}

	static watch(ipcName, data, actions, self){
		electron.ipcRenderer.send(ipcName, data)
		if(menuMap.has(ipcName)) {
			electron.ipcRenderer.removeListener(ipcName, menuMap.get(ipcName))
			menuMap.delete(ipcName)
		}
		const callback = (event, value) => {
			menuMap.delete(ipcName)
			if(isObject(value)){
				if(value.scope){
					let temp = actions
					for(const i of value.scope.split('.')){
						temp = temp[i]
					}
					return temp.call(self)
				}
			}
			actions[value]()
		}
		menuMap.set(ipcName, callback)
		electron.ipcRenderer.once(ipcName, callback)
	}
}

export default ContextMenu
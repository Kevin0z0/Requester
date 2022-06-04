'use strict'
import {
	app,
	protocol,
	globalShortcut,
	ipcMain,
	BrowserWindow
} from 'electron'

import './preload'

import ContextMenu from "@/utils/contextMenu";

import {createProtocol} from 'vue-cli-plugin-electron-builder/lib'


const isDevelopment = process.env.NODE_ENV !== 'production'
const electron = require('electron')
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
	{scheme: 'requester', privileges: {secure: true, standard: true}}
])

function screenPxCalc(obj) {
//create a relatively suitable window
	const proportionX = 1020 / 1920
	const proportionY = 650 / 1040
	return {
		width: obj.width * proportionX,
		height: obj.height * proportionY
	}
}


new ContextMenu('Tree')
new ContextMenu('Input')



let win
async function createWindow() {
	const screen = screenPxCalc(electron.screen.getPrimaryDisplay().workArea)
	win = new BrowserWindow({
		width: Math.max(screen.width, 1020),
		height: Math.max(screen.height, 650),
		minWidth: 650,
		minHeight: 650,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false,
			contextIsolation: false,
			nodeIntegrationInWorker: true,
			enableRemoteModule: true
		},
		// titleBarStyle: 'hidden',
		// frame: false
	})
	// global.sharedObject.language = app.getLocale()
	// electron.Menu.setApplicationMenu(null)
	if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
		if (!process.env.IS_TEST) win.webContents.openDevTools()
	} else {
		createProtocol('requester')
		// Load the index.html when not in development
		win.loadURL('requester://./index.html')
	}
	// preventDragbarContext(win)
	// win.webContents.openDevTools()

	win.on('closed', () => {
		win = null
	})
}

// app.allowRendererProcessReuse = false
// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
	globalShortcut.register('CommandOrControl+Shift+i', function () {
		win.webContents.openDevTools()
	})
	if (isDevelopment && !process.env.IS_TEST) {
		// Install Vue Devtools
		try {
			const {default: installExtension, VUEJS_DEVTOOLS} = require('electron-devtools-installer')
			installExtension(VUEJS_DEVTOOLS)
				.then(name => {console.log(`Added Extension:  ${name}`)})
				.catch(err => console.log('An error occurred: ', err))
		} catch (e) {
			console.error('Vue Devtools failed to install:', e.toString())
		}
	}
	createWindow()
})

ipcMain.handle('read-user-data', () => {
	return electron.app.getPath('userData');
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
	if (process.platform === 'win32') {
		process.on('message', (data) => {
			if (data === 'graceful-exit') {
				app.quit()
			}
		})
	} else {
		process.on('SIGTERM', () => {
			app.quit()
		})
	}
}
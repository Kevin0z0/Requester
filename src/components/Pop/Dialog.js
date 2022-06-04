import {h, render, watch, isVNode} from 'vue'
import dialogComponent from './Dialog.vue'
import {isStr} from "@/utils/functions";

const dialogInstance = new Map()

const initInstance = (props, container) => {
	const vnode = h(dialogComponent, props)
	render(vnode, container)
	document.body.appendChild(container.firstElementChild)
	return vnode.component
}

const showDialog = (options) => {
	const container = document.createElement('div')
	options.onVanish = () => {
		render(null, container)
		dialogInstance.delete(vm)
	}

	options.onAction = (action) => {
		const message = dialogInstance.get(vm)
		if(action.status === 'close' || action.status === 'cancel'){
			message.reject(action.text)
		}else if(action.status){
			message.resolve(action.text)
		}
	}

	const instance = initInstance(options, container)
	const vm = instance.proxy
	vm.message = options.message

	watch(
		() => vm.message,
		(newVal, oldVal) => {
			if (isVNode(newVal)) {
				// Override slots since message is vnode type.
				instance.slots.default = () => [newVal]
			} else if (isVNode(oldVal) && !isVNode(newVal)) {
				delete instance.slots.default
			}
		},
		{
			immediate: true,
		}
	)
	vm.visible = true
	return vm
}

function Dialog(options){
	let callback
	if (isStr(options) || isVNode(options)) {
		options = {
			message: options,
		}
	} else {
		callback = options.callback
	}
	return new Promise((resolve, reject)=>{
		const vm = showDialog(options)

		dialogInstance.set(vm, {
			options,
			callback,
			resolve,
			reject
		})
	})
}

//
// export default (title, content, buttons) => {
// 	const vnode = h(Dialog, {
// 		title,
// 		content,
// 		buttons
// 	})
// 	const app = document.createElement('div')
// 	render(vnode, app)
// 	document.body.appendChild(app.firstElementChild)
// }


export default Dialog
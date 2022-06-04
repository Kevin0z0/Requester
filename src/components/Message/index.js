import {isStr} from "@/utils/functions";
import {isVNode, render, h} from 'vue'
import messageComponent from "./Message";
import {Queue} from "@/utils/functions";

const queue = new Queue(5)

const initInstance = (props, container) => {
	const vnode = h(messageComponent, props)
	render(vnode, container)
	let ele = document.getElementById('message-box')
	if(!ele){
		ele = document.createElement('div')
		ele.id = 'message-box'
		document.body.append(ele)
	}
	ele.appendChild(container.firstElementChild)
	return vnode.component
}

function showMessage(options){
	const container = document.createElement('div')
	options.onVanish = (pop=true) => {
		pop && queue.pop()
		render(null, container)
	}
	if (queue.full()){
		queue.pop().$emit('vanish', false)
	}
	const instance = initInstance(options, container)
	const vm = instance.proxy
	vm.visible = true
	queue.push(vm)
	return vm
}

export default function (options){
	if(isStr(options) || isVNode(options)){
		options = {
			message: options
		}
	}
	showMessage(options)
}

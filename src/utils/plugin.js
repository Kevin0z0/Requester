import plugins from "@/store/global/plugins";

export function getTextMenuFunction(){
	return plugins.state.textMenu.reduce((prev, current) => {
		prev[current.name] = current.main
		return prev
	}, {})
}

export function getTextMenuInfo(){
	return plugins.state.textMenu.reduce((prev, current) => {
		prev.push(current.info.menu)
		return prev
	}, [{type: 'separator'}])
}
const color = new Map([
	["GET", "green"],
	["POST", "orange"],
	["DELETE", "red"],
	["PUT", "blue"]
])

export function getColor(method){
	const result = color.get(method)
	if(!result) return "grey"
	return result
}

export const limitLength = str => {
	if(str.length < 100) return str
	return str.slice(0, 100) + "..."
}

export function setEditorHeight(height){
	return {
		immediate: true,
		handler(){
			this.$nextTick(()=>{
				this.editor && this.editor.setHeight(Math.max(0, this.height - height))
			})
		}
	}
}
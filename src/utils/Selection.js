export default class {
	constructor() {
		this.selection = window.getSelection()
	}

	get text(){
		return this.selection.toString()
	}

	get node(){
		return this.selection.baseNode
	}

	setRange(node, range){
		const newRange = new Range()
		newRange.setStart(node,range.start);
		newRange.setEnd(node,range.end);
		this.selection.removeAllRanges();
		this.selection.addRange(newRange);
	}

	// replace(text){
	// 	// const start = this.selection.anchorOffset
	// 	const range = this.selection.getRangeAt(0);
	// 	this.selection.deleteFromDocument()
	// 	const node = document.createTextNode(text)
	// 	range.insertNode(node)
	// 	// this.setRange(node.parentNode.firstChild, {
	// 	// 	start: start,
	// 	// 	end: start + node.length
	// 	// })
	// }

	replace(text){
		document.execCommand('insertText', false, text)
	}
}
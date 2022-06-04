export function insertItem(father, child){
	const children = father.children
	if(!children){
		father.children = [child]
	}else{
		let flag = true
		if(child.isFolder){
			for (const i in children){
				if(!children[i].isFolder){
					children.splice(Math.max(0, i-1), 0, child)
					flag = false
					break
				}
			}
		}
		if(flag){
			children.push(child)
		}
	}
}
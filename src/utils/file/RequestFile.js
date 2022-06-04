const fs = window.require('fs')
class RequestFile{
	constructor(data, error) {
		if(!data) return
		if(data.constructor === String){
			try{
				const pathList = data.split(/[/\\]/)
				this.path = data
				this.name = pathList[pathList.length - 1]
				this.size = fs.statSync(data).size
			}catch (e){
				this.path = this.name = this.size = undefined
				error && error(e)
			}
		}else{
			this.path = data.path
			this.name = data.name
			this.size = data.size
		}
	}

	toJSON(){
		return this.path;
	}

	hasFile(){
		return !!this.path
	}
}

export default RequestFile
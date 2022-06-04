let str = "b=2&a=1"
let params = [
	['a','1','123123', false],
	['c','23434', '', true],
	['a','1','',true],
]

let ptr = -1
const temp = []
const strArr = str.split('&')
for(let i = 0; i < strArr.length; i++){
	const item = strArr[i]
	const equal = item.indexOf("=")
	const val = equal < 0 ?
		[item, "", "",true] :
		[item.slice(0, equal), item.slice(equal + 1), "",true]
	let flag = false
	while(++ptr < params.length){
		const target = params[ptr]
		if(!target[3]){
			temp.push(target)
		}else{
			temp.push(val)
			flag = true
			break
		}
	}
	if(!flag) temp.push(val)
}
while(++ptr < params.length)
	if(!params[ptr][3])
		temp.push(params[ptr])
console.log(temp)
const tempArr = params.reduce((prev, current)=>{
	current[3] && prev.push([...current])
	return prev
}, [])
console.log(temp)

for(let i = 0; i < temp.length; i++){
	for(let j = 0; j < tempArr.length; j++){
		const t = tempArr[j]
		if(temp[i][3] && t[3] && temp[i][0] === t[0]){
			temp[i][2] = t[2]
			t[3] = false
			break
		}
	}
}
console.log(temp)
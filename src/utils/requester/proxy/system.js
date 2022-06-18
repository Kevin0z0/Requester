const { process, require } = window
const cp = require('child_process');

function win(done, failed){
	try{
		cp.exec('REG QUERY "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"',(error, stdout, stderr)=>{
			if(error || stderr){
				cb({error: error || stderr})
			}
			const value = {}
			stdout.split('\r\n').forEach(v=>{
				const str = v.trim()
				for(let i of ['ProxyEnable', 'ProxyOverride', 'ProxyServer']) {
					if (str.startsWith(i)) {
						const arr = str.split('    ')
						value[arr[0]] = arr[2]
						return
					}
				}
			})
			if(value['ProxyEnable'] === '0x0') return done(null)
			value['ProxyOverride'] = value['ProxyOverride']
				.replace(/\./g,"\\.")
				.replace(/\*/g,".*")
				.split(',').map(v=>v.trim())
			done(value)
		})
	}catch (e){
		failed(null)
	}
}

export default function (){
	return new Promise((resolve, reject) => {
		if(process.platform === 'win32'){
			return win(resolve, reject)
		}
	})
}
import parser from './parser'

class CookieJar {
	cookies = {}

	constructor(cookies, domain) {
		if(!cookies || !domain) return
		this.setCookies(cookies, domain)
	}

	getCookies(domain, path) {
		if(!this.cookies[domain]) return false
		let cookies = []
		for (let i of this.cookies[domain]) {
			if ((i.domain + i.path).indexOf(domain + path) > -1) {
				cookies.push(i.name + "=" + i.value)
			}
		}
		if(!cookies.length) return false
		return cookies.join("; ")
	}

	setCookies(cookies, domain){
		if(!cookies) return
		for (let i of cookies) {
			const cookie = parser(i, domain);
			const item = this.cookies[cookie.domain]
			if(item){
				let flag = true
				for(let j in item){
					if(item[j].name === cookie.name){
						item[j] = cookie
						flag = false
						break
					}
				}
				flag && item.push(cookie)
			}else
				this.cookies[cookie.domain] = [cookie]
		}
	}

	getCookieList(){
		const arr = []
		for(let i in this.cookies)
			for(let j of this.cookies[i])
				arr.push(j)
		return arr
	}

	get(key){
		for(let i in this.cookies)
			for(let j of this.cookies[i])
				if(j.name === key)
					return j.value
		return null
	}
	has(key){
		return this.get(key) !== null
	}
}

// let jar = new CookieJar(["BAIDUID_BFESS=A1AAD3154E2E4D2AD1870C8A7ABA6C31:FG=1; path=/; domain=.baidu.com; secure; expires=Thu, 24 Nov 2022 05:09:47 GMT;"], ".baidu.com")

export default CookieJar
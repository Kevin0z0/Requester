import {marked} from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

export default function (code, desc){
	if(!code) code = desc
	const rendererMD = new marked.Renderer()
	marked.setOptions({
		renderer: rendererMD,
		gfm: true,
		tables: true,
		breaks: false,
		pedantic: false,
		sanitize: false,
		smartLists: true,
		smartypants: false,
		langPrefix: '',
		highlight: function(code, lang) {
			return hljs.highlightAuto(code, [lang]).value
		}
	})
	return marked(code)
}
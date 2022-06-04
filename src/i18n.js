import { createI18n } from 'vue-i18n/index'

function loadLocaleMessages () {
	// reference from https://github.com/lyswhut/lx-music-desktop/blob/master/src/renderer/lang/index.js
	const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
	const messages = {}

	for (const file of locales.keys()) {
		const path = file.replace(/(\.\/|\.json$)/g, '').split('/')
		path.reduce((o, s, i) => {
			if (o[s]) return o[s]
			o[s] = i + 1 === path.length ? locales(file) : {}
			return o[s]
		}, messages)
	}
	return messages
}


const language = navigator.language || "en"
// const language = 'en'
const i18n = createI18n({
	fallbackLocale: 'en',
	globalInjection:true,
	legacy: false,
	locale: language,
	messages: loadLocaleMessages(),
});

export default i18n
import anime from 'animejs/lib/anime.es.js';

export const close = (mainValue, contentValue, cb) => {
	anime({
		targets: mainValue,
		opacity: 0,
		easing: 'linear',
		duration: 200
	})
	anime({
		targets: contentValue,
		translateY: '10px',
		easing: 'cubicBezier(.5, .05, .1, .3)',
		duration: 200,
		complete(){
			cb && cb()
		}
	})
}

export const open = (mainValue, contentValue, cb) => {
	anime({
		targets: mainValue,
		opacity: 1,
		easing: 'linear',
		duration: 200
	})
	anime({
		targets: contentValue,
		translateY: '0px',
		easing: 'cubicBezier(.5, .05, .1, .3)',
		duration: 200,
		complete() {
			cb && cb()
		}
	})
}
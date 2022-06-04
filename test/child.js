const {NodeVM} = require("vm2");

const vm = new NodeVM({
	require: {
		external: true
	},
	callback: function(){
		console.log(...arguments)
	}
});
vm.run(`console.log({1:2,3:4})`);
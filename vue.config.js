const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
module.exports = {
	productionSourceMap: false,
	css: {
		loaderOptions: {
			// sass: {
			// 	implementation: require('sass'), // This line must in sass option
			// },
			scss: {
				additionalData: `
					@import '~@/assets/scss/typography.scss';
					@import '~@/assets/scss/mixins.scss';
					@import '~@/assets/scss/public.scss';
				`
			}
		},
	},
	devServer: {
		host: '127.0.0.1',
		port: 9099
	},
	configureWebpack:{
		plugins:[
			new MonacoWebpackPlugin()
		],
		module: {
			rules:[
				{
					test: /\.thread\.js$/,
					use: [{
						loader: 'worker-loader',
					}],
				}
			]
		},
	},
	pluginOptions: {
		electronBuilder: {
			customFileProtocol: 'requester://./',
			externals: [
				"fs",
				"form-data",
				"better-sqlite3",
				"vm2",
				"jsonwebtoken"
			],
			builderOptions: {
				appId: "com.Requester.0.1.0",
				productName: "Requester",
				copyright: "Copyright © 2022 Kevin0z0",
				win: {
					icon: "build/icon.ico",
					target: [
						{
							target: "nsis",
							arch: [
								"x64"
							]
						}
					],
					extraResources: ["plugins/**", "requester.sqlite"]
				},
				nsis: {
					oneClick: false,
					allowToChangeInstallationDirectory: true,
					installerIcon: "build/icon.ico",
					installerHeaderIcon: "build/icon.ico",
					deleteAppDataOnUninstall: true
				},
			}
		},
	}
}

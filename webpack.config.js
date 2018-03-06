var path = require('path');

var phaserModule = path.join(__dirname, '/node_modules/phaser-ce/');
var phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
var pixi = path.join(phaserModule, 'build/custom/pixi.js');
var p2 = path.join(phaserModule, 'build/custom/p2.js');

module.exports = {
	entry: ["babel-polyfill","./main.js"],
	output: {
		filename: "bundle.js",
		path: __dirname
	},
	devServer: {
		contentBase: "./"
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: { 
					loader: 'babel-loader',
					options: {
						presets: ['env'],
						plugins: ["transform-async-to-generator"]
					}
				}
			},
			{ 
				test: /pixi\.js/, 
				use: ['expose-loader?PIXI'] 
			},
      		{ 
      			test: /phaser-split\.js$/, 
      			use: ['expose-loader?Phaser'] 
      		},
			{ 
				test: /p2\.js/, 
				use: ['expose-loader?p2'] 
			}
		]
	},
	resolve: {
    	alias: {
    		'phaser': phaser,
    		'pixi': pixi,
    		'p2': p2,
    		"resources": path.join(__dirname, 'resources')
    	}
	}
};

const WebExtension = require('web-extension-webpack-plugin');
const is_pro = process.env.NODE_ENV === 'production';

const config = {
	devtool: "source-map",
	context: __dirname + "/src",
    entry: "./main",
    
    output: {
        path: __dirname + "/page",
        filename: "page.js"
    },

    //plugins: []
};
 
/*
if(!is_pro){
    config.plugins.push(
        new WebExtension({
            background: './background.js'
        })
    );
}
*/

module.exports = config;
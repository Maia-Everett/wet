const config = {
    mode: "production",
	devtool: "source-map",
	context: __dirname + "/src",
    entry: "./main",
    
    output: {
        path: __dirname + "/dist/page",
        filename: "page.js"
    },

    module: {
        rules: [
            {
                test: /\.ejs$/,
                loader: 'compile-ejs-loader'
            }
        ]
    }
};

module.exports = config;
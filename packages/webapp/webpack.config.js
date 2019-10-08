const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'bundle.js',
        publicPath: '/',
    },
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        watchContentBase: true,
        compress: true,
        port: 9001
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
            },
            {
              test: /\.(js|jsx)$/,
              exclude: /node_modules/,
              loader: 'babel-loader'
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
          ]
    },
}
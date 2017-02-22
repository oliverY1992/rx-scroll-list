var webpack = require('webpack');
var path = require('path');
module.exports = {
    entry:{
        app:'./src',
    },
    output:{
        path: path.resolve(__dirname, 'dist'),
        publicPath:'/',
        filename:'[name].bundle.js',
        libraryTarget:'umd',
        library:'rx-scroll-list'
    },
    resolve:{
        extensions:['*','.scss','.js']
    },
    devtool:'eval-source-map',
    module:{
        rules:[{
            test:/\.js$/,
            loader:'babel-loader',
            exclude: /node_modules/
        },{
            test:/\.scss$/,
            exclude:/node_modules/,
            use:[{
                loader:'style-loader'
            },{
                loader:'css-loader',
                options:{
                    sourceMap:true
                }
            },{
                loader:'sass-loader',
                options:{
                    outputStyle:'expanded',
                    sourceMap:true
                }
            }]
        }]
    },
    externals:{
        'react':'React',
        'react-dom':'ReactDOM'
    }
}

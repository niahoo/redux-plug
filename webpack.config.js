var path = require('path')
var webpack = require('webpack')
var prod = process.env.NODE_ENV === 'production'

module.exports = {
  entry: './src/index.js',
  output : {
    filename: prod ? 'redux-plug.min.js' : 'redux-plug.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  },
  plugins: prod ? [
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    })
  ] : []
}

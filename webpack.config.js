var path = require('path');
var webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  entry: './src/main.js',
  plugins: [
    new VueLoaderPlugin,
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ],
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: '[name].[hash].js',
    chunkFilename: '[name].[chunkhash].js'
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'vue-style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  devServer: {
    host: '127.0.0.1',
    port: 8081,
    openPage: 'dist/',
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    proxy: [
      {
        context: ['/api', '/login', '/product', '/inventory'],
        target: 'http://127.0.0.1:8000',
        secure: false,
        changeOrigin: true,
      }
    ]
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    // new webpack.optimize.UglifyJsPlugin({
    //   sourceMap: true,
    //   compress: {
    //     warnings: false
    //   }
    // }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}

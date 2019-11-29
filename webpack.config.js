const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

// config created following a very nice guide from https://fullstackopen.com/en/part7/webpack

// build configuration for electron main file
// it's only used to set global environment variable WEBPACK_MODE
const config_electron_main = (env, argv) => {
  const mode = argv.mode;
  return {
    target: 'electron-main', // for files that should be compiled for electron main process
    entry: ['./src/electron.js'],
    output: {
      filename: 'electron.js',
      path: __dirname + '/build'
    },
    devtool: 'source-map',
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'WEBPACK_MODE': JSON.stringify(mode)
        }
      })
    ]
  }
}

// build configuration for react files
const config_electron_react_renderer = (env, argv) => {
  return {
    // for files that should be compiled for electron renderer process
    target: 'electron-renderer', 
    // no need for polyfill for electron projects
    // as we targeting chrome anyway
    entry: [/*'@babel/polyfill',*/  './src/index.js'],
    output: {
      filename: 'index.js',
      path: __dirname + '/build'
    },
    devtool: 'source-map',
    // build directory contents will be served from dev-server to enable hot reload
    devServer: {
      contentBase: path.resolve(__dirname, 'build'),
      compress: true,
      port: 3132,
    },
    // babel transpilers to transpile JSX and CSS
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          query: {
            // presence of @babel/preset-env is also questionable
            // as we targeting chrome
            presets: ['@babel/preset-env' ,'@babel/preset-react'],
            plugins: [
              ["import", { "libraryName": "antd", "libraryDirectory": "es", "style": "css" }], // `style: true` for less
              '@babel/plugin-proposal-class-properties'
            ],
          },
        },
        {
          test: /\.css$/,
          loaders: ['style-loader', 'css-loader'],
        },
        { 
          test: /\.(png|woff|woff2|eot|ttf|svg)$/, 
          loader: 'url-loader?limit=100000' 
        }
      ],
    },
    plugins: [
      // copy static files to build directory
      new CopyPlugin([
        {
          from: 'src/index.html',
          to: ''
        },
        {
          from: 'src/sounds/',
          to: 'sounds/'
        }
      ]),
    ]
  }
}

// important: export config with webpack-dev-server configuration first ! otherwise it gets lost
module.exports = [config_electron_react_renderer, config_electron_main];
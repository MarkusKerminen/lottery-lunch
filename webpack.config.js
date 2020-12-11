/**
 * @file webpack.config.js
 * @author Oula Antere
 * @email oula.antere@gmail.com
 *
 * Using Amit Agarwal's Google Apps Script Starter Kit
 * Check it at https://github.com/labnol/apps-script-starter
 */

const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GasPlugin = require('gas-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const { version } = require('./package.json');

const mode = 'none'; // or production

const src = path.resolve(__dirname, 'src');
const destination = path.resolve(__dirname, 'dist');

module.exports = {
  mode,
  context: __dirname,
  entry: `${src}/index.js`,
  output: {
    filename: `code-${version}.js`,
    path: destination,
    libraryTarget: 'this'
  },
  resolve: {
    extensions: ['.js']
  },
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        uglifyOptions: {
          ie8: true,
          warnings: false,
          mangle: false,
          compress: {
            properties: false,
            warnings: false,
            drop_console: false
          },
          output: {
            beautify: true
          }
        }
      })
    ]
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          cache: true,
          failOnError: false,
          fix: true
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      {
        from: `${src}/**/*.html`,
        flatten: true,
        to: destination
      },
      {
        from: `${src}/../appsscript.json`,
        to: destination
      }
    ]),
    new GasPlugin({
      comments: false
    })
  ]
};

// IF AND WHEN BREAKS
// BUT https://stackoverflow.com/questions/63379652/validationerror-invalid-options-object-copy-plugin-has-been-initialized-using

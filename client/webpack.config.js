/**
 * TODO: separate dev and prod configurations.
 */

const path = require('path');
const process = require('process');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

if (!process.env.MAPBOX_TOKEN) {
  console.error(
    'MAPBOX_TOKEN is missing from .env file, falling back to raster maps'
  );
}

module.exports = {
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? undefined : 'inline-source-map',
  entry: path.resolve('src', 'index.tsx'),
  resolve: {
    extensions: ['.ts', '.js', '.tsx']
  },
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          // disable type checker - we will use it in the ForkTsCheckerWebpackPlugin
          transpileOnly: true
        }
      },
      {
        test: /\.(png|svg|jpg|gif|babylon)$/,
        use: 'file-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        loader: ['style-loader', 'css-loader'],
        exclude: /node_modules/,
      }
    ]
  },
  devServer: {
    host: '0.0.0.0',  // enable usage of another device in the network
    contentBase: 'dist',
    historyApiFallback: true,
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({ reportFiles: 'src/**/*.{ts,tsx}', tslint: true }),
    new HtmlWebpackPlugin({
      template: 'index.html'
    }),

    // something weird going on with EnvironmentPlugin? Lets use defineplugin
    // instead
    new webpack.DefinePlugin({
      DEFINE_NODE_ENV: JSON.stringify(isProd ? 'production' : 'development'),
      DEFINE_MAPBOX_TOKEN: JSON.stringify(process.env.MAPBOX_TOKEN),
    }),
    new CopyPlugin(['asset/404.html'])
  ]
}
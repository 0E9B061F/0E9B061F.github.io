"use strict"


const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const Site = require("./src/make.js")

const MODE = process.env.NODE_ENV || "production"


// A JavaScript class.
class MyExampleWebpackPlugin {
  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    // Specify the event hook to attach to
    compiler.hooks.beforeCompile.tapAsync('MyPlugin', (params, callback) => {
      console.log("PERFORMING STATIC COMPILATION")
      const site = new Site(path.resolve(__dirname))
      site.compile()
      callback();
    });
  }
}

const rules = [
  { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
  { test: /\.css$/i,
    use: [MiniCssExtractPlugin.loader, "css-loader"],
  },
  { test: /\.s[ac]ss$/i,
    use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
  },
]
const plugins = [
  new MiniCssExtractPlugin({
    filename: "site/0E9B061F.css",
  }),
  new MyExampleWebpackPlugin(),
]

console.log(`BUILDING ${MODE}`)

module.exports = {
  entry: "./src/build.js",
  mode: MODE,
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname),
    filename: "site/0E9B061F.js",
  },
  module: { rules },
  resolve: {
    extensions: ['*', '.js']
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname),
      watch: {
        ignored: [
          path.resolve(__dirname, './node_modules'),
        ],
      },
    },
  },
  plugins,
}

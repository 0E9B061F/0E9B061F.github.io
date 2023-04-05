import path from "path"
import { fileURLToPath } from 'node:url'
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import Site from "./hexmachine/site.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MODE = process.env.NODE_ENV || "production"
const OUTP = "/tmp/build"


class MyExampleWebpackPlugin {
  apply(compiler) {
    compiler.hooks.beforeCompile.tapAsync('MyPlugin', (params, callback) => {
      console.log("PERFORMING STATIC COMPILATION")
      Site.make({
        path: path.resolve(__dirname),
        outPath: path.resolve(OUTP),
      }).then(site=> {
        site.compile().then(()=> {
          callback()
        })
      })
    })
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

export default {
  entry: "./build.mjs",
  mode: MODE,
  devtool: "source-map",
  output: {
    path: path.resolve(OUTP),
    filename: "site/0E9B061F.js",
  },
  module: { rules },
  resolve: {
    extensions: ['*', '.js']
  },
  devServer: {
    static: {
      directory: path.resolve(OUTP),
      watch: {
        path: "./src/posts",
        ignored: [
          path.resolve(OUTP, './node_modules'),
        ],
      },
    },
  },
  plugins,
}

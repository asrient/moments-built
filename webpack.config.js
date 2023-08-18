const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    moments: "./index.js",
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] }
      },
      {
        test: /\.(s*)css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: { 
  extensions: ["*", ".js", ".jsx"],
  fallback: { "buffer": require.resolve('buffer/'), } 
},
  output: {
    path: path.join(__dirname, "../desktop/bundle"),
    publicPath: "/",
    filename: "[name].js"
  },
  // plugins: [new webpack.HotModuleReplacementPlugin()]
};
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",

  devtool: "cheap-module-source-map",

  entry: {
    background: path.resolve(__dirname, "src", "background.ts"),
    content: path.resolve(__dirname, "src", "content.ts"),
    //popup: path.resolve(__dirname, "src", "popup.ts"),
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },

  resolve: {
    extensions: [".ts", ".js"],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "public",
          to: ".",
        },
      ],
    }),
  ],
};

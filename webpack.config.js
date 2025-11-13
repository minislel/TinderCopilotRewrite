const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "development",

  devtool: "cheap-module-source-map",

  entry: {
    background: path.resolve(__dirname, "src/background", "background.ts"),
    injectHook: path.resolve(
      __dirname,
      "src/background/fetchInterception",
      "injectHook.ts"
    ),
    content: path.resolve(__dirname, "src/content/", "content.ts"),
    popup: path.resolve(__dirname, "src/popup/", "popup.ts"),
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: [".ts", ".js"],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, "src/popup/"),
        use: ["style-loader", "css-loader", "postcss-loader"],
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
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src/popup/", "popup.html"), // Skąd brać szablon
      filename: "popup.html", // Jak ma się nazywać w 'dist'
      chunks: ["popup"], // Mówi, żeby wstrzyknąć *TYLKO* 'popup.js'
    }),
  ],
};

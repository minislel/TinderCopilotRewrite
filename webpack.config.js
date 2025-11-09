const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = {
  mode: "development",

  devtool: "cheap-module-source-map",

  entry: {
    background: path.resolve(__dirname, "src/background", "background.ts"),
    injectHook: path.resolve(__dirname, "src/background/", "injectHook.ts"),
    content: path.resolve(__dirname, "src", "content.ts"),
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
        use: [
          MiniCssExtractPlugin.loader, // 3. Wyciąga CSS do osobnego pliku
          "css-loader", // 2. Tłumaczy CSS dla Webpacka
          "postcss-loader", // 1. Przetwarza CSS (Tailwindem)
        ],
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
    new MiniCssExtractPlugin({
      filename: "popup.css", // Nazwiemy go 'popup.css'
    }),
  ],
};

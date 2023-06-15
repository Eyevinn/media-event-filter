const { merge } = require("webpack-merge");
const common = require("./webpack.common.cjs");
const path = require("path");

module.exports = merge(common, {
  mode: "development",
  entry: ["./src/media-event-filter.ts"],
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: 9000,
  },
});

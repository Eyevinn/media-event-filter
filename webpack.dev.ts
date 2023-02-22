const { merge } = require("webpack-merge");
const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "development",
  entry: ["./src/media-event-filter.ts"],
});

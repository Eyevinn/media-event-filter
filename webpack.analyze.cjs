const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const { merge } = require("webpack-merge");
const prod = require("./webpack.prod.cjs");

module.exports = merge(prod, {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "server",
      logLevel: "silent",
      generateStatsFile: true,
    }),
  ],
});

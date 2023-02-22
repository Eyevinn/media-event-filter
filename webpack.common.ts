module.exports = {
  entry: ["./src/media-event-filter"],
  output: {
    library: {
      type: "commonjs2",
    },
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: [/node_modules/],
        use: ["swc-loader"],
      },
    ]
  },
  devtool: "source-map",
  plugins: [],
};

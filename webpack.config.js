module.exports = {
  entry: "./src/index.js",
  target: "webworker",
  mode: "development",
  devtool: "source-map",
  output: {
    filename: "worker.js",
    sourceMapFilename: "worker.js.map"
  },
  optimization: {
    minimize: true
  },
};

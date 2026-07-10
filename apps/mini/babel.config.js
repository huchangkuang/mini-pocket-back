// babel-preset-taro 更多选项和默认值：
// https://github.com/NervJS/taro/blob/next/packages/babel-preset-taro/README.md
module.exports = {
  presets: [
    [
      "taro",
      {
        framework: "react",
        ts: true,
      },
    ],
    ["@babel/preset-env", { targets: { node: "current" } }],
  ],
  plugins: [
    [
      "import",
      {
        libraryName: "@nutui/nutui-react-taro",
        libraryDirectory: "dist/es/packages",
        camel2DashComponentName: false,
        style: false,
      },
      "nutui-react-taro",
    ],
  ],
};

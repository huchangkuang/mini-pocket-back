var barcode = require("./barcode");
var qrcode = require("./qrcode");
const { getSystemInfoSync } = require("@tarojs/taro");

function convert_length(length) {
  return Math.round((getSystemInfoSync().windowWidth * length) / 750);
}

function barc(id, code, width, height, rotate = false) {
  barcode.code128(
    wx.createCanvasContext(id),
    code,
    convert_length(width),
    convert_length(height),
    rotate
  );
}

function qrc(id, code, width, height) {
  qrcode.api.draw(code, {
    ctx: wx.createCanvasContext(id),
    width: convert_length(width),
    height: convert_length(height),
  });
}

module.exports = {
  barcode: barc,
  qrcode: qrc,
};

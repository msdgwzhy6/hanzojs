"use strict";

require("whatwg-fetch");

var _wrapFetch = require("./wrap-fetch.js");

var _wrapFetch2 = _interopRequireDefault(_wrapFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 名称：浏览器fetch
 * 日期：2016-11-09
 * 描述：用于提供浏览器端fetch
 */

module.exports = (0, _wrapFetch2.default)(self.fetch);
"use strict";

var _nodeFetch = require("node-fetch");

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _wrapFetch = require("./wrap-fetch.js");

var _wrapFetch2 = _interopRequireDefault(_wrapFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 名称：node服务器fetch
 * 日期：2016-11-09
 * 描述：用于提供node端fetch
 */

module.exports = (0, _wrapFetch2.default)(_nodeFetch2.default);
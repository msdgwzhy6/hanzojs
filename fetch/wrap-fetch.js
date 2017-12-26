"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 名称：fetch包裹工具
 * 日期：2016-11-09
 * 描述：包裹fetch 设置baseUrl
 */

var FetchWrapper = function () {

    /**
     * 构造函数
     */
    function FetchWrapper(fetch) {
        _classCallCheck(this, FetchWrapper);

        this.originFetch = fetch;
        this.initGlobal();
    }

    /**
     * 强制初始化全局对象
     */


    _createClass(FetchWrapper, [{
        key: "initGlobal",
        value: function initGlobal() {
            var fetch = this.originFetch;
            if (typeof global == 'undefined') {
                window.global = window;
            }
            global.fetch = this.fetch.bind(this);
            global.Response = fetch.Response;
            global.Headers = fetch.Headers;
            global.Request = fetch.Request;
        }

        /**
         * 发起请求
         */

    }, {
        key: "fetch",
        value: function fetch(url, params) {
            url = (global.fetchBaseUri || "") + url;
            var fetch = this.originFetch;
            return fetch(url, params);
        }
    }]);

    return FetchWrapper;
}();

module.exports = function (fetch) {
    var wrapper = new FetchWrapper(fetch);
    return global.fetch;
};
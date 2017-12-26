'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Plugin = function () {
  function Plugin() {
    _classCallCheck(this, Plugin);

    this.hooks = {
      dev: [],
      onAction: [],
      extraReducers: {}
    };
  }

  _createClass(Plugin, [{
    key: 'use',
    value: function use(plugin) {
      (0, _invariant2.default)((0, _isPlainObject2.default)(plugin), 'plugin.use: plugin should be plain object');
      var hooks = this.hooks;
      for (var key in plugin) {
        (0, _invariant2.default)(hooks[key], 'plugin.use: unknown plugin property: ' + key);
        if (Array.isArray(plugin[key])) {
          var _hooks$key;

          (_hooks$key = hooks[key]).push.apply(_hooks$key, _toConsumableArray(plugin[key]));
        } else {
          hooks[key] = plugin[key];
        }
      }
    }
  }, {
    key: 'get',
    value: function get(key) {
      var hooks = this.hooks;
      return hooks[key];
    }
  }]);

  return Plugin;
}();

exports.default = Plugin;
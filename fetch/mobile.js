'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _nodeFetch = require('./node-fetch.js');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fetch = fetch || _nodeFetch2.default;

var Type = Dante.type;

function _getHeader(headers) {
  return {
    headers: _extends({
      'Content-Type': 'application/json'
    }, headers)
  };
}

function _transformParam(params) {
  return {
    body: JSON.stringify({ data: params })
  };
}

/**
 * 将一个对象转换成queryString
 */
function paramToString(obj) {
  var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

  obj = obj || {};
  var querys = [];
  var keys = Object.keys(obj);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      var v = obj[key];
      var nkey = prefix == "" ? key : prefix + '[' + key + ']';
      if ((0, _isPlainObject2.default)(v) || Array.isArray(v)) {
        querys.push(this.param(v, nkey));
      } else {
        querys.push(nkey + '=' + obj[key]);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return querys.join('&');
}

function Get(url, headers, params) {
  return fetch(url + '?' + paramToString(params), _extends({ method: 'GET' }, _getHeader(headers))).then(function (response) {
    return response.json();
  }).catch(function (error) {
    return Promise.reject(error);
  }).then(function (response) {
    if (response.code == '200') {
      return response;
    } else {
      return Promise.reject(response);
    }
  });
}

function Post(url, headers, params) {
  return fetch(url, _extends({ method: 'POST' }, _getHeader(headers), _transformParam(params))).then(function (response) {
    return response.json();
  }).catch(function (error) {
    return Promise.reject(error);
  }).then(function (response) {
    if (response !== null) {
      if (response.code == '200') {
        return response;
      } else {
        return Promise.reject(response);
      }
    } else {
      return Promise.reject(response);
    }
  });
}

module.exports = {
  Get: Get, Post: Post
};
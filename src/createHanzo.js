'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = createHanzo;

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _redux = require('redux');

var _reactNavigation = require('react-navigation');

var _reactRedux = require('react-redux');

var _reduxActions = require('redux-actions');

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

var _plugin = require('./plugin');

var _plugin2 = _interopRequireDefault(_plugin);

var _global = require('./global');

var _global2 = _interopRequireDefault(_global);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var STORE_UPDATE = 'hanzojs/store_update';

function createHanzo(createOpts) {
  var mobile = createOpts.mobile,
      initialReducer = createOpts.initialReducer,
      defaultHistory = createOpts.defaultHistory,
      routerMiddleware = createOpts.routerMiddleware,
      setupHistory = createOpts.setupHistory;


  return function hanzo() {
    var hooks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var history = hooks.history || defaultHistory;
    var initialState = hooks.initialState || {};
    delete hooks.history;
    delete hooks.initialState;

    var plugin = new _plugin2.default();

    var app = {
      // properties
      _models: [],
      _reducers: {},
      _views: {},
      _router: null,
      _routerProps: {},
      _routes: null,
      _store: null,
      _history: null,
      _isomorphic: hooks.isomorphic || false,

      // methods
      use: use,
      registerModule: registerModule,
      router: router,
      start: start,
      getStore: getStore,
      getRoutes: getRoutes,
      getModule: getModule
    };

    return app;

    /***********************************
    /* Methods
    /***********************************
     /**
     * Register an object of hooks on the application.
     *
     * @param hooks
     */
    function use(hooks) {
      plugin.use(hooks);
    }

    /**
     * Register a module
     *
     * @param module
     */
    function registerModule(module) {
      var me = this;
      if ((0, _isPlainObject2.default)(module)) {
        loadModule.call(me, module);
      } else if (typeof module === 'function') {
        module(function (callback, name) {
          if (typeof callback === 'function') {
            lazyload.call(me, callback, name);
          } else if ((0, _isPlainObject2.default)(callback)) {
            loadModule.call(me, callback);
          }
        });
      }
    }

    function loadModule(module, resolve) {
      var _this = this;

      this._models.push(module.models);

      Object.keys(module.views).map(function (view) {
        if (_this._views[view] && _this._views[view].lazy) {
          resolve(module.views[view]);
        }
      });

      this._views = _extends({}, this._views, module.views);

      if ((0, _isPlainObject2.default)(module.models)) {
        var Actions = {};
        var _namespace = module.models.namespace.replace(/\/$/g, '');
        Object.keys(module.models.reducers).map(function (key) {
          if (key.indexOf('REACT_NATIVE_ROUTER_FLUX') !== -1) {
            Actions[key] = module.models.reducers[key];
          } else if (key.startsWith('/')) {
            Actions[key.substr(1)] = module.models.reducers[key];
          } else {
            Actions[_namespace + '/' + key] = module.models.reducers[key];
          }
        });
        var _temp = (0, _reduxActions.handleActions)(Actions, module.models.state);
        var _arr = _namespace.split('/');
        _genObject(this._reducers, _arr, _temp);
      }

      if (module.publicHandlers && Array.isArray(module.publicHandlers)) {
        module.publicHandlers.map(function (item) {
          _global2.default.registerHandler(namespace.replace(/\//g, '.') + '.' + item.name, item.action);
        });
      }
    }

    function lazyload(callback, name) {
      var _this2 = this;

      var me = this;
      name.map(function (item) {
        _this2._views[item] = function () {
          return new Promise(function (resolve, reject) {
            if (_this2._views[item].lazy) {
              callback(function (module) {
                loadModule.call(me, module, resolve);
                _this2._store.replaceReducer(getReducer.call(_this2));
              });
            } else {
              resolve(_this2._views[item]);
            }
          });
        };
        _this2._views[item].lazy = true;
      });
    }

    function _genObject(obj, arr, res) {
      if (arr.length > 1) {
        var hierachy = arr.splice(0, 1)[0];
        obj[hierachy] = obj[hierachy] || {};
        _genObject(obj[hierachy], arr, res);
      } else {
        obj[arr[0]] = res || {};
      }
    }

    function router(router, props) {
      this._router = router(this._views);
      this._routerProps = props || {};
    }

    function start(container) {
      if (typeof container === 'string') {
        container = document.querySelector(container);
      }
      // setup history
      if (setupHistory) setupHistory.call(this, history);

      if (mobile) {
        var me = this;
        var AppNavigator = me._router;
        var store = getStore.call(me);
        var isomorphic = me._isomorphic;
        var App = function App(_ref) {
          var dispatch = _ref.dispatch,
              nav = _ref.nav;
          return _react2.default.createElement(AppNavigator, { navigation: (0, _reactNavigation.addNavigationHelpers)({ dispatch: dispatch, state: nav }) });
        };
        var mapStateToProps = function mapStateToProps(state) {
          return {
            nav: state.nav
          };
        };

        var AppWithNavigationState = (0, _reactRedux.connect)(mapStateToProps)(App);

        return function (_Component) {
          _inherits(_class, _Component);

          function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
          }

          _createClass(_class, [{
            key: 'render',
            value: function render() {
              isomorphic ? store = getStore.call(me) : null;
              return _react2.default.createElement(
                _reactRedux.Provider,
                { store: store },
                _react2.default.createElement(AppWithNavigationState, null)
              );
            }
          }]);

          return _class;
        }(_react.Component);
      }
    }

    function getModule(name) {
      return this._views[name];
    }

    function getReducer() {
      var _this4 = this;

      // extra reducers
      var extraReducers = plugin.get('extraReducers');

      var mergeReducers = _deepmerge2.default.all([this._reducers, extraReducers]);
      for (var k in mergeReducers) {
        if (_typeof(mergeReducers[k]) === 'object') {
          mergeReducers[k] = (0, _redux.combineReducers)(mergeReducers[k]);
        }
      }

      var navInitialState = this._router.router.getStateForAction(this._router.router.getActionForPathAndParams(this._router.initialRouteName));

      var navReducer = function navReducer() {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : navInitialState;
        var action = arguments[1];

        var nextState = _this4._router.router.getStateForAction(action, state);

        // Simply return the original `state` if `nextState` is null or undefined.
        return nextState || state;
      };

      var appReducer = (0, _redux.combineReducers)(_extends({
        nav: navReducer
      }, initialReducer, mergeReducers));
      return appReducer;
    }

    function getStore() {
      var middlewares = plugin.get('onAction');

      if (!mobile) {
        middlewares.push(routerMiddleware(history));
      }

      var enhancer = _redux.applyMiddleware.apply(undefined, _toConsumableArray(middlewares));
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        var devTools = plugin.get('dev') || function (noop) {
          return noop;
        };
        if (devTools.apply) {
          enhancer = (0, _redux.compose)(_redux.applyMiddleware.apply(undefined, _toConsumableArray(middlewares)), devTools);
        }
      }

      var createAppStore = enhancer(_redux.createStore);

      this._store = _extends(this._store || {}, createAppStore(getReducer.call(this), initialState));
      return this._store;
    }

    function getRoutes() {
      return this._routes;
    }

    ////////////////////////////////////
    // Helpers

    function getProvider(store, app, scenes) {
      var _onUpdate = app._routerProps.onUpdate;

      var Router = require('../router').Router;
      return function () {
        return _react2.default.createElement(
          _reactRedux.Provider,
          { store: store },
          _react2.default.createElement(
            Router,
            _extends({ history: app._history }, app._routerProps, { onUpdate: function onUpdate() {
                return _onUpdate && _onUpdate.call(this, app._store);
              } }),
            scenes
          )
        );
      };
    }

    function render(container, store, app, scenes) {
      var ReactDOM = require('react-dom');
      ReactDOM.render(_react2.default.createElement(getProvider(store, app, scenes)), container);
    }
  };
}
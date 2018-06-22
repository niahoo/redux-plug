/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.composeReducers = composeReducers;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(this, arguments));
  };
}

function composeReducers() {
  for (var _len = arguments.length, reducers = Array(_len), _key = 0; _key < _len; _key++) {
    reducers[_key] = arguments[_key];
  }

  reducers = reducers.filter(function (red) {
    return red;
  });
  if (reducers.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (reducers.length === 1) {
    return reducers[0];
  }

  return function (state, action) {
    return reducers.reduce(function (state, f) {
      return f(state, action);
    }, state);
  };
}

var createReducer = exports.createReducer = function createReducer() {
  var initialState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


  var registry = {};

  var reducer = function reducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    var reducers = registry[action.type];
    if (reducers) {
      return composeReducers.apply(undefined, _toConsumableArray(reducers))(state, action);
    } else {
      return state;
    }
  };

  reducer.register = function (registerFun) {
    registerFun = typeof registerFun === 'function' ? registerFun : typeof registerFun.register === 'function' ? registerFun.register : null;
    if (null === registerFun) {
      throw new Error("reducer.registerFun expects a function or an object with a register method.");
    }
    // Call the reducer module function with a function that waits for action
    // types and corresponding reducer
    registerFun(function (actionTypes, reducer) {
      actionTypes = [].concat(actionTypes); // Handle a single action or array
      actionTypes.forEach(function (type) {
        if (!registry[type]) {
          registry[type] = [];
        }
        // unshift instead of push as we use composeReducers
        registry[type].unshift(reducer);
      });
    });
    return reducer; // allows to chain plugs
  };

  reducer.plug = reducer.register; // backward compat

  return reducer;
};

var createPlugApp = exports.createPlugApp = function createPlugApp() {
  var app = {};
  var pluggableReducer = createReducer();

  var dispatch = function dispatch() {
    throw new Error("You must apply the store enhancer before adding plugs.");
  };

  var plug = function plug(scope, specs) {
    if (arguments.length === 1) {
      specs = scope;
      scope = '__root__';
    }
    var _specs = specs,
        actions = _specs.actions;

    var api = {};
    if ((typeof actions === 'undefined' ? 'undefined' : _typeof(actions)) === 'object') {
      Object.keys(actions).forEach(function (k) {
        var actionType = '@@plug/' + scope + '/' + k;
        var creator = buildActionCreator(actionType, actions[k]);
        var action = bindActionCreator(creator.creatorFunction, dispatch);
        api[k] = action;
        var reducer = buildReducer(creator);
        pluggableReducer.register(function (reduce) {
          return reduce(actionType, reducer);
        });
      });
    }
    return scope === '__root__' ? api : _defineProperty({}, scope, api);
  };

  var enhancer = function enhancer(next) {
    return function createStore(baseReducer, preloadedState, enhancer) {
      var reducer = composeReducers(baseReducer, pluggableReducer);
      var store = next(reducer, preloadedState, enhancer);
      dispatch = store.dispatch;
      return store;
    };
  };
  app.enhancer = enhancer;
  app.plug = plug;
  return app;
};

function buildActionCreator(actionType, spec) {
  if (typeof spec === 'function') {
    // If the actionCreator is a function, then it returns a reducer.
    var creatorFunction = function actionCreator() {
      var reducer = spec.apply(undefined, arguments);
      return { type: actionType, reducer: reducer };
    };
    return { creatorType: 'REDUCER_CLOSURE', creatorFunction: creatorFunction };
  }
}

function buildReducer(creator) {
  var creatorType = creator.creatorType;

  switch (creatorType) {
    case 'REDUCER_CLOSURE':
      return applyClosureReducer;
  }
}

function applyClosureReducer(state, _ref2) {
  var reducer = _ref2.reducer;

  return reducer(state);
}

/***/ })
/******/ ]);
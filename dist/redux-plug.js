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
/* WEBPACK VAR INJECTION */(function(process) {

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.composeReducers = composeReducers;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var __action_creators__ = Symbol('__action_creators__');
var __is_plug__ = Symbol('__is_plug__');
var __reducers__ = Symbol('__reducers__');
var __is_payload_action__ = Symbol('__is_payload_action__');

// Create plug
// - 1 We will create a new api of action creators with different
//   properties of the plug:
//   - actions are expected to return a payload. Reducers with the
//     same name will reduce thoses actions. If the action returns a
//     function, it will not be wrapped as a payload in order to let
//     redux-thunk do its magic. If the payload has a string .type, a
//     warning will be emitted but it will still be wrapped as a
//     payload.
//   - creators will be let unchanged.
//   - mutations will be wrapped as action creators that return a
//     callback reducer, and a reducer will be added to execute the
//     callback.

function createPlug(spec, opts) {
    var _plug;

    var scope = opts.scope ? '@@plug/' + opts.scope : '@@plug';
    var actionSpecs = spec.actions,
        creatorSpecs = spec.creators,
        mutationSpecs = spec.mutations;
    var reducerSpecs = spec.reducers;

    var plug = (_plug = {}, _defineProperty(_plug, __action_creators__, []), _defineProperty(_plug, __is_plug__, true), _plug);
    var reducers = reducersCollection();
    if ((typeof actionSpecs === 'undefined' ? 'undefined' : _typeof(actionSpecs)) === 'object') {
        Object.keys(actionSpecs).forEach(function (k) {
            var actionType = scope + '/' + k;
            var creator = buildPayloadActionCreator(actionType, actionSpecs[k], plug);
            plug[k] = creator;
            plug[__action_creators__].push(k);
            // No reducer here, reducers for payload have to be
            // declared and match the name
        });
    }
    if ((typeof mutationSpecs === 'undefined' ? 'undefined' : _typeof(mutationSpecs)) === 'object') {
        Object.keys(mutationSpecs).forEach(function (k) {
            var actionType = scope + '/' + k;
            var creator = buildMutationActionCreator(actionType, mutationSpecs[k], plug);
            plug[k] = creator;
            plug[__action_creators__].push(k);
            // We will attach a default reducer for this mutation
            reducers.add(actionType, applyClosureReducer);
        });
    }
    if ((typeof creatorSpecs === 'undefined' ? 'undefined' : _typeof(creatorSpecs)) === 'object') {
        Object.keys(creatorSpecs).forEach(function (k) {
            var creator = function actionCreator() {
                return creatorSpecs[k].apply(plug, arguments);
            };
            plug[k] = creator;
            plug[__action_creators__].push(k);
        });
    }
    // Base format for reducerSpecs :: reducerSpecs
    //     reducerSpecs :: [reducerSpec]
    //       reducerSpec :: [actionTypes, reducerFunctions]
    //         actionTypes :: [String] | String
    //         reducerFunctions :: [Function] | Function
    // But we accept an object. In this case, the keys are prefixed
    // with the scope
    if ((typeof reducerSpecs === 'undefined' ? 'undefined' : _typeof(reducerSpecs)) === 'object' && !Array.isArray(reducerSpecs)) {
        var asArray = [];
        Object.keys(reducerSpecs).forEach(function (k) {
            var actionType = scope + '/' + k;
            asArray.push([actionType, reducerSpecs[k]]);
        });
        reducerSpecs = asArray;
    }
    if (Array.isArray(reducerSpecs)) {
        reducerSpecs.forEach(function (reducerSpec) {
            var _reducerSpec = _slicedToArray(reducerSpec, 2),
                actionTypes = _reducerSpec[0],
                reducerFunctions = _reducerSpec[1];

            actionTypes = [].concat(actionTypes);
            reducerFunctions = [].concat(reducerFunctions);
            actionTypes.forEach(function (actionType) {
                reducerFunctions.forEach(function (reducerFunction) {
                    reducers.add(actionType, wrapPayloadReducer(reducerFunction));
                });
            });
        });
    }
    plug[__reducers__] = reducers;
    return plug;
}

function applyClosureReducer(state, _ref) {
    var reducer = _ref.reducer;

    return reducer(state);
}

function warnAboutPayloadTypeProperty(actionType) {
    console.warn('plug action \'' + actionType + '\' is wrapped in a payload but declares a \'type\' property. You may want to declare a creator instead of an action');
}

function buildPayloadActionCreator(actionType, userCreatorFn, self) {
    var actionCreator = function actionCreator() {
        // here, self is the instance of action creators holders
        var payload = userCreatorFn.apply(self, arguments);
        if (typeof payload === 'function') {
            // allow redux-thunk
            return payload;
        }
        if (payload && typeof payload.type === 'string') {
            warnAboutPayloadTypeProperty(actionType);
        }
        return _defineProperty({
            type: actionType,
            payload: payload
        }, __is_payload_action__, true);
    };
    if (process.env.NODE_ENV === 'development') {
        actionCreator._originalActionCreator = userCreatorFn;
    }
    return actionCreator;
}

function buildMutationActionCreator(actionType, userCreatorFn, self) {
    var actionCreator = function actionCreator() {
        // here, self is the instance of action creators holders
        var reducer = userCreatorFn.apply(self, arguments);
        if (typeof reducer !== 'function') {
            throw new Error('Mutation ' + actionType + ' must return a function.');
        }
        return {
            type: actionType,
            reducer: reducer
        };
    };
    if (process.env.NODE_ENV === 'development') {
        actionCreator._originalActionCreator = userCreatorFn;
    }
    return actionCreator;
}

function reducersCollection() /*base*/{
    var _registry = {};
    return {
        registry: function registry() {
            return _registry;
        },
        add: function add(type, reducer) {
            var arr = _registry[type] = _registry[type] || [];
            arr.push(reducer);
        }
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
    var registry = {};
    var reducer = function reducer() {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var action = arguments[1];

        var reducers = registry[action.type];
        if (reducers) {
            return composeReducers.apply(undefined, _toConsumableArray(reducers))(state, action);
        } else {
            return state;
        }
    };
    reducer.merge = function (collection) {
        var patch = collection.registry();
        Object.keys(patch).forEach(function (k) {
            registry[k] = (registry[k] || []).concat(patch[k]);
        });
    };
    return reducer;
};

var createPlugApp = exports.createPlugApp = function createPlugApp() {
    var pluggableReducer = createReducer();

    var dispatch = function dispatch() {
        throw new Error("You must apply the store enhancer before adding plugs.");
    };

    var pluggable = {};

    Object.defineProperty(pluggable, 'plug', {
        value: function attachPlug(scope) {
            var spec = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            opts.scope = scope;
            var plug = createPlug(spec, opts);
            pluggableReducer.merge(plug[__reducers__]);
            this[scope] = plug;
            return this;
        },
        writable: false
    });

    Object.defineProperty(pluggable, 'bind', {
        value: function bind(scope) {
            var plug = this[scope];
            if (!plug || !plug[__is_plug__]) {
                throw new Error('Plug ' + scope + ' does not exist.');
            }
            var api = {};
            plug[__action_creators__].forEach(function (k) {
                api[k] = bindPlugActionCreators(plug[k], dispatch, plug);
            });
            return api;
        },
        writable: false
    });

    var enhancer = function enhancer(next) {
        return function createStore(baseReducer, preloadedState, enhancer) {
            var reducer = composeReducers(baseReducer, pluggableReducer);
            var store = next(reducer, preloadedState, enhancer);
            dispatch = store.dispatch;
            return store;
        };
    };
    Object.defineProperty(pluggable, 'enhancer', {
        value: enhancer,
        writable: false
    });
    return pluggable;
};

function wrapPayloadReducer(reducer) {
    return function (state, action) {
        if (action[__is_payload_action__]) {
            return reducer(state, action.payload, action);
        } else {
            return reducer(state, action);
        }
    };
}

function bindPlugActionCreators(actionCreator, dispatch, plug) {
    // 'plug' is the actions creators holder instance created in
    // attachPlug
    return function () {
        return dispatch(actionCreator.apply(plug, arguments));
    };
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ })
/******/ ]);
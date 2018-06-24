const __action_creators__ = Symbol('__action_creators__')
const __is_plug__ = Symbol('__is_plug__')
const __reducers__ = Symbol('__reducers__')

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
    const scope = opts.scope ? `@@plug/${opts.scope}` : '@@plug'
    const {
        actions: actionSpecs,
        creators: creatorSpecs,
        mutations: mutationSpecs,
    } = spec
    let {
        reducers: reducerSpecs,
    } = spec
    const plug = {
        [__action_creators__]: [],
        [__is_plug__]: true,
    }
    const reducers = reducersCollection( /*spec.reducers*/ )
    if (typeof actionSpecs === 'object') {
        Object.keys(actionSpecs).forEach(k => {
            const actionType = `${scope}/${k}`
            const creator = buildPayloadActionCreator(actionType, actionSpecs[k], plug)
            plug[k] = creator
            plug[__action_creators__].push(k)
                // No reducer here, reducers for payload have to be
                // declared and match the name
        })
    }
    if (typeof mutationSpecs === 'object') {
        Object.keys(mutationSpecs).forEach(k => {
            const actionType = `${scope}/${k}`
            const creator = buildMutationActionCreator(actionType, mutationSpecs[k], plug)
            plug[k] = creator
            plug[__action_creators__].push(k)
                // We will attach a default reducer for this mutation
            reducers.add(actionType, applyClosureReducer)
        })
    }
    if (typeof creatorSpecs === 'object') {
        Object.keys(creatorSpecs).forEach(k => {
            const creator = function actionCreator() {
                return creatorSpecs[k].apply(plug, arguments)
            }
            plug[k] = creator
            plug[__action_creators__].push(k)
        })
    }
    // Base format for reducerSpecs :: reducerSpecs
    //     reducerSpecs :: [reducerSpec]
    //       reducerSpec :: [actionTypes, reducerFunctions]
    //         actionTypes :: [String] | String
    //         reducerFunctions :: [Function] | Function
    // But we accept an object. In this case, the keys are prefixed
    // with the scope
    if (typeof reducerSpecs === 'object' && !Array.isArray(reducerSpecs)) {
        const asArray = []
        Object.keys(reducerSpecs).forEach(k => {
            const actionType = `${scope}/${k}`
            asArray.push([actionType, reducerSpecs[k]])
        })
        reducerSpecs = asArray
    }
    if (Array.isArray(reducerSpecs)) {
        reducerSpecs.forEach(reducerSpec => {
            let [actionTypes, reducerFunctions] = reducerSpec
            actionTypes = [].concat(actionTypes)
            reducerFunctions = [].concat(reducerFunctions)
            actionTypes.forEach(actionType => {
                reducerFunctions.forEach(reducerFunction => {
                    reducers.add(actionType, reducerFunction)
                })
            })
        })
    }
    plug[__reducers__] = reducers
    return plug
}

function applyClosureReducer(state, { reducer }) {
    return reducer(state)
}

function warnAboutPayloadTypeProperty(actionType) {
    console.warn(`plug action '${actionType}' is wrapped in a payload but declares a 'type' property. You may want to declare a creator instead of an action`)
}

function buildPayloadActionCreator(actionType, userCreatorFn, self) {
    const actionCreator = function() {
        // here, self is the instance of action creators holders
        const payload = userCreatorFn.apply(self, arguments)
        if (typeof payload === 'function') {
            // allow redux-thunk
            return payload
        }
        if (payload && typeof payload.type === 'string') {
            warnAboutPayloadTypeProperty(actionType)
        }
        return {
            type: actionType,
            payload
        }
    }
    if (process.env.NODE_ENV === 'development') {
        actionCreator._originalActionCreator = userCreatorFn
    }
    return actionCreator
}

function buildMutationActionCreator(actionType, userCreatorFn, self) {
    const actionCreator = function() {
        // here, self is the instance of action creators holders
        const reducer = userCreatorFn.apply(self, arguments)
        if (typeof reducer !== 'function') {
            throw new Error(`Mutation ${actionType} must return a function.`)
        }
        return {
            type: actionType,
            reducer
        }
    }
    if (process.env.NODE_ENV === 'development') {
        actionCreator._originalActionCreator = userCreatorFn
    }
    return actionCreator
}

function reducersCollection( /*base*/ ) {
    const registry = {}
    return {
        registry: () => registry,
        add: (type, reducer) => {
            const arr = (registry[type] = registry[type] || [])
            arr.push(reducer)
        },
    }
}

export function composeReducers(...reducers) {
    reducers = reducers.filter(red => red)
    if (reducers.length === 0) {
        return arg => arg
    }

    if (reducers.length === 1) {
        return reducers[0]
    }

    return (state, action) => reducers.reduce((state, f) => {
        return f(state, action)
    }, state)
}

export const createReducer = () => {
    const registry = {}
    const reducer = (state = {}, action) => {
        const reducers = registry[action.type]
        if (reducers) {
            return composeReducers(...reducers)(state, action)
        } else {
            return state
        }
    }
    reducer.merge = function(collection) {
        const patch = collection.registry()
        Object.keys(patch).forEach(k => {
            registry[k] = (registry[k] || []).concat(patch[k])
        })
    }
    return reducer
}

export const createPlugApp = function() {
    const pluggableReducer = createReducer()

    let dispatch = function() {
        throw new Error("You must apply the store enhancer before adding plugs.")
    }

    const pluggable = {}

    Object.defineProperty(pluggable, 'plug', {
        value: function attachPlug(scope, spec = {}, opts = {}) {
            opts.scope = scope
            const plug = createPlug(spec, opts)
            pluggableReducer.merge(plug[__reducers__])
            this[scope] = plug
            return this
        },
        writable: false
    })

    Object.defineProperty(pluggable, 'getPlugApi', {
        value: function attachPlug(scope) {
            const plug = this[scope]
            if (!plug || !plug[__is_plug__]) {
                throw new Error(`Plug ${scope} does not exist.`)
            }
            const api = {}
            plug[__action_creators__]
                .forEach(k => {
                    api[k] = bindPlugActionCreators(plug[k], dispatch, plug)
                })
            return api
        },
        writable: false
    })

    const enhancer = function(next) {
        return function createStore(baseReducer, preloadedState, enhancer) {
            const reducer = composeReducers(baseReducer, pluggableReducer)
            const store = next(reducer, preloadedState, enhancer)
            dispatch = store.dispatch
            return store
        }
    }
    Object.defineProperty(pluggable, 'enhancer', {
        value: enhancer,
        writable: false
    })
    return pluggable
}

function bindPlugActionCreators(actionCreator, dispatch, plug) {
    // 'plug' is the actions creators holder instance created in
    // attachPlug
    return function() {
        return dispatch(actionCreator.apply(plug, arguments))
    }
}

function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(this, arguments))
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


export const createReducer = (initialState = {}) => {

  const registry = {}

  const reducer = (state = initialState, action) => {
    const reducers = registry[action.type]
    if (reducers) {
      return composeReducers(...reducers)(state, action)
    } else {
      return state
    }
  }

  reducer.register = registerFun => {
    registerFun = typeof registerFun === 'function' ? registerFun
         : typeof registerFun.register === 'function' ? registerFun.register
         : null
    if (null === registerFun) {
      throw new Error("reducer.registerFun expects a function or an object with a register method.")
    }
    // Call the reducer module function with a function that waits for action
    // types and corresponding reducer
    registerFun((actionTypes, reducer) => {
      actionTypes = [].concat(actionTypes) // Handle a single action or array
      actionTypes.forEach(type => {
        if (! registry[type]) {
          registry[type] = []
        }
        // unshift instead of push as we use composeReducers
        registry[type].unshift(reducer)
      })
    })
    return reducer // allows to chain plugs
  }

  reducer.plug = reducer.register // backward compat

  return reducer
}

export const createPlugApp = function() {
  const app = {}
  const pluggableReducer = createReducer()

  let dispatch = function() {
    throw new Error("You must apply the store enhancer before adding plugs.")
  }

  const plug = function (scope, specs) {
    if (arguments.length === 1) {
      specs = scope
      scope = '__root__'
    }
    const { actions } = specs
    const api = {}
    if (typeof actions === 'object') {
      Object.keys(actions).forEach(k => {
        const actionType = `@@plug/${scope}/${k}`
        const creator = buildActionCreator(actionType, actions[k])
        const action = bindActionCreator(creator.creatorFunction, dispatch)
        api[k] = action
        const reducer = buildReducer(creator)
        pluggableReducer.register(reduce => reduce(actionType, reducer))
      })
    }
    return scope === '__root__' ? api : {[scope]: api}
  }

  const enhancer = function(next) {
    return function createStore(baseReducer, preloadedState, enhancer) {
      const reducer = composeReducers(baseReducer, pluggableReducer)
      const store = next(reducer, preloadedState, enhancer)
      dispatch = store.dispatch
      return store
    }
  }
  app.enhancer = enhancer
  app.plug = plug
  return app
}

function buildActionCreator(actionType, spec) {
  if (typeof spec === 'function') {
    // If the actionCreator is a function, then it returns a reducer.
    const creatorFunction = function actionCreator(...args) {
      const reducer = spec(...args)
      return { type: actionType, reducer }
    }
    return { creatorType: 'REDUCER_CLOSURE', creatorFunction}
  }
}

function buildReducer(creator) {
  const { creatorType } = creator
  switch (creatorType) {
    case 'REDUCER_CLOSURE':
      return applyClosureReducer
  }
}

function applyClosureReducer(state, { reducer }) {
  return reducer(state)
}

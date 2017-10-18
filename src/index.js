export const createReducer = (initialState = {}) => {

  const registry = {}

  const reducer = (state = initialState, action) => {
    const reducers = registry[action.type]
    if (reducers) {
      return reducers.reduce((state, reducer) => {
        return reducer(state, action)
      }, state)
    } else {
      return state
    }
  }

  reducer.plug = register => {
    const plug =
      typeof register === 'function' ? register :
      typeof register.plug === 'function' ? register.plug :
      null
    if (null === plug) {
      throw new Error("reducer.plug expects a function or an object with a plug method.")
    }
    // Call the reducer module function with a function that waits for action
    // types and corresponding reducer
    plug((actionTypes, reducer) => {
      actionTypes = [].concat(actionTypes) // Handle a single action or array
      actionTypes.forEach(type => {
        if (! registry[type]) {
          registry[type] = []
        }
        registry[type].push(reducer)
      })
    })
    return reducer // allows to chain plugs
  }

  return reducer
}

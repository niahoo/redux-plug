# Redux Plug

This library is a simple tool to group you redux code by domain.

You can group the actions and reducers for a same domain in a same file (or
folder, or whatever you like).

Then, you create a single reducer in which you can plug your modules.

As the reducer is a regular reducer, you do not have to keep it as the only
reducer. You can use it with combineReducers or any other library.


## Install

    npm install redux-plug --save
    yarn add redux-plug

## How to use

First, you create your pluggable modules:

```javascript
//: src/plugs/ui.js

import {
  SOME_ACTION
} from '../constants'

// Actions are defined along with the reducers, but you don't HAVE to.

export const doSomenthingAction = someInput => ({
  type: SOME_ACTION, someInput
})

// The only required part is a function that will accept a function to register
// your reducers with an action type.
// The registering function is called "reduce" here, because it is like calling
// "reduce this action with this reducer".

export const plug = reduce => {

  // reduce this action with this reducer function.
  reduce(SOME_ACTION, (state, { cssSelector }) => {
    return state.setIn(['ui', 'currentPanel'], cssSelector)
  })

  // reducer function is defined elsewhere in the module (or even imported).
  reduce(SOME_ACTION, reducingFunction)

  // react to multiple actions with the same reducer.
  reduce([SOME_ACTION, SOME_OTHER_ACTION], reducingFunction)

  // react to an action with multiple reducers. They will be called in order.
  reduce(SOME_ACTION, fun1)
  reduce(SOME_ACTION, fun2)
}

```

Then, you create a reducer and plug your modules in:

```javascript
//: src/store.js

// Import the library
import { createReducer } from 'redux-plug'

// Import your plugs
import { plug as plugUI } from './plugs/ui'
import { plug as plugTodos } from './plugs/todos'

const reducer = createReducer(/* Optional initial state here */)
  .plug(plugUI)
  .plug(plugTodos)

const store = createStore(
  reducer
  // , initialState
  // , applyMiddleware(logger,thunk)
)
```

As the plug system requires only constants and functions, you can register
reducers for any action type in any module.

## TODO

### Scoping system

- [ ] Pass an options object to `createReducer` (as 2nd arg) to give a `scoping`
      function. The default function uses define property, but a custom function
      can be used to use an immutable library :

      {
        scoping: (state, key, changes) => state.update(key, changes)
      }



- [ ] Pass a scope name to the `plug` function to enable the scoping behaviour
      for this plug:

      const reducer = createReducer(initialState, {scoping: myScopingFun})
        .plug(plugUI, 'ui')

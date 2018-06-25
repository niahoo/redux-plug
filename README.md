# Redux Plug

This library is a simple tool to group you redux code by domain.

You can group the actions and reducers for a same domain in a same file (or
folder, or whatever you like).


## Install

    npm install redux-plug --save
    yarn add redux-plug

## How to use

First, you create a "plug" then you attach it to your store with a scope : 

A plug can export creators, actions, mutations and reducers.
- Creators remain unchanged.
- Actions must return a payload
- Reducers whose name match an action name will receive the payload :
  `reducer(state, payload, action)` instead of `reducer(state, action)`. So you 
  can still listen for any action of the application. Reducers receive the full
  store state. Future feature will allow to scope the state too.
- Mutations are action creators that return a reducer, i.e. a function that must
  accept the current state and return a new state. *Despite the name, redux
  still requires you to respect immutability of the state and return a new
  object*.

```javascript
//: src/plugs/test.js
const setStateValue = (state, number) => ({ ...state, number })

export default {
    mutations: {
        setNumber(n) {
            return oldState => setStateValue(oldState, n)
        }
    },
    actions: {
        increment() {},
        multiply(x) { return x },
        intDivide(x) { return x },
    },
    reducers: {
        increment: state => setStateValue(state, state.number + 1),
        multiply: (state, x) => setStateValue(state, state.number * x),
        intDivide: [
            (state, x) => setStateValue(state, state.number / x),
            (state, x) => setStateValue(state, Math.round(state.number)),
        ],
    }
}

```

To attach the plug to a store, you must create a plug application, and give its
enhancer when you create the store. This mechanism allows to keep a standard
redux store compatible with any other redux libraries and any other middleware.

```javascript
//: src/store.js

// Import the library
import { createPlugApp } from 'redux-plug'

// Import your plugs
import plugTest from './plugs/test'

// Create the plug application 
const app = createPlugApp()

// Prepare a store enhancer, maybe add some middleware like redux-thunk
const storeEnhancer = compose(
    app.enhancer,
    applyMiddleware(thunk)
)

// Redux-plug allows you to give no defaut reducer, but you can of course give
// any reducer to the store. The reducer of redux-plug will be added
// automatically.

const reducer = myReducer // or null if you want
const store = createStore(myReducer, initialState, storeEnhancer)

// You can now plug your modules in the app
app.plug('test', testPlug)

// The application gives action creators
store.dispatch(app.test.setNumber(1))
store.dispatch(app.test.increment())
store.dispatch(app.test.multiply(100))
store.dispatch(app.test.intDivide(3))

// You can get bound creators this way
const testApi = app.bind('test')

testApi.increment() // equivalent to store.dispatch(app.test.increment())
```

## TODO

### State Scoping system

- [ ] Pass a scope name to the `plug` function to enable the scoping behaviour
      for this plug, so the plug's reducers only work with a part of the state.

      app.plug('myPlug', myPlug, { stateScope: 'subStateKey' })

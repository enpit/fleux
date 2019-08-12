## Motivation

Handling state in React can be cumbersome. **fleux** aims to alleviate your pain by providing you with easily accessible stores that connect your application's components.

**fleux** aims to offer an elegant API that is simultaneously flexible enough to allow you to write your application the way *you* want! You should only ever need to use those parts of **fleux** that you actually need.

### Flexible, Not Flux

The [flux pattern](http://facebook.github.io/flux/) prohibits views from mutating state directly and instead enforces the use of actions. This makes complete sense, but we think, whether to exclusively rely on actions to change the state, is a decision for the application developer and not one, that a library should dictate! Libraries are tools that developers use to solve their problems and thus they should be flexible enough to support the developer instead of restricting them.

## !Development Notice!

**This library in its very early stages of development. Its current feature set is limited and its API subject to change.**

## Installation

You know the drill:

```sh
npm i fleux
```

**fleux** comes with bundles in ESM, CJS and UMD formats, so you should be all set to use it in whatever environment or workflow you need to target.

## Basic Usage

The following basic example shows you how to use **fleux** to implement a little counter:

```js
import React from 'react';
import { render } from 'react-dom';
import { connect, withState } from 'fleux';

// Write your component as you would do if it were just taking props.
const CounterDisplay = function ({counter}) {
    return (
        <div>Counter is {counter}</div>
    )
}

// Use the `withState` HOC to have your component consume a value from the store.
const CounterDisplayWithState = withState('counter')(CounterDisplay);

// For a component to be able to alter data in the store, it can use a corresponding setter function.
const CounterButton = function ({setCounter}) {
    return (
        <button onClick={() => setCounter((counter) => counter+1)}>Count</button>
    )
}

// Again, just use `withState`, which injects the setter prop into your component.
const CounterButtonWithState = withState('counter')(CounterButton);

// Define your app and include the stateful components.
const App = function () {
    return (
        <div>
            <CounterDisplayWithState />
            <CounterButtonWithState />
        </div>
    )
}

// Connect the root component of your app to a data store, initializing it with some data.
const Root = connect(App, { counter: 0 })

// Render your app to the page and enjoy the stateful components in action!
render(<Root />, document.getElementById('root'));
```

### Mutating State

Your components don't need to use actions to mutate the state in the store, but can use a setter function that is injected into their props.

```js
const CounterButton = function ({setCounter}) {
    return (
        <button onClick={() => setCounter((counter) => counter+1)}>Count</button>
    )
}
const CounterButtonWithState = withState('counter')(CounterButton);
```

The name of the setter for a key `foo` in the store is automatically set to `setFoo`, i.e. the key is pascal-cased and then prefixed with `set`.

A setter function either takes the new value or a function that will be called with the current value and returns the new one (similar to React's own `setState`).

#### Prevent rerenders on write-only components

If a component only mutates a value in the store without needing to read it, it is not nessecary to rerender that component, when the value changes. To tell **fleux** that a value is write-only, you can do this:

```js
withState(null, ['toBeWritten'])
```

If one of the first two arguments to `withState` is an array, the function assumes the first argument to be an array of readable keys from the store and the second to be a list of writeable keys. A component will not be rerendered when a value changes, that the component does not read.

### Connecting a store

In the examples above, there was no point at which the app was connected to a store. This is possible in **fleux** for brevity's sake, but not recommended as all the components will reuse the same default store.

You can and should connect a store to a subtree in your application using the `connect` method like this:

```js
const AppWithStore = connect(App, { counter: 0 })
```

**fleux** takes care of making the store that is connected to `App` to all of its children.

You can provide default values for store keys in the object that is passed to `connect` as a second argument.

### Direct Access

If you need access to the store outside of a React component, you can easily get it:

```js
import { createStore } from 'fleux';

// If you want to use the state store not only in your React components, create it like this.
const store = createStore();
```

(In general it is not recommended to create a store without initializing any values).

You can now access your state as properties on the store (accessor properties behind the scenes take care of the rest). The store offers a small API for subscribing to changes like this:

```js
store.subscribe('foo', ({foo}) => console.log(foo));
store.foo = 'bar'; // logs 'bar'
```

This direct store access allows you to connect the state store used in your React components to other parts of your application.

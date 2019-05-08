## Motivation

Handling state in React can be cumbersome. **fleux** aims to alleviate your pain by providing you with easily accessible stores that connect your application's components.

**fleux** aims to offer an elegant API that is simultaneously flexible enough to allow you to write your application the way *you* want! You should only ever need to use those parts of **fleux** that you actually need.

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
render(<Root />, document.getElementById('root));
```

### Direct Access

If you need access to the store outside of a React component, you can easily get it:

```js
import { createStore } from 'fleux';

// If you want to use the state store not only in your React components, create it like this
const store = createStore();
```

You can now access your state as properties on the store (accessor properties behind the scenes take care of the rest). The store offers a small API for subscribing to changes like this:

```js
store.subscribe('foo', ({foo}) => console.log(foo));
store.foo = 'bar'; // logs 'bar'
```

This direct store access allows you to connect the state store used in your React components to other parts of your application.

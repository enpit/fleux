## Installation

You know the drill:

```sh
npm i fleux
```

**fleux** comes packages in ESM, CJS and UMD formats, so you should be all set to use it in whatever environment or workflow you need to target.

## Basic Usage

The following basic example shows you how to use **fleux**.

```js
import React from 'react';
import { render } from 'react-dom';
import { connect, withState } from 'state';

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

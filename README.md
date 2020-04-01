## Motivation

Handling state in React can be cumbersome. **fleux** aims to alleviate your pain by providing you with easily accessible stores that connect your application's components.

**fleux** aims to offer an elegant API that is simultaneously flexible enough to allow you to write your application the way *you* want! You should only ever need to use those parts of **fleux** that you actually need.

### Flexible, Not Flux

The [flux pattern](http://facebook.github.io/flux/) prohibits views from mutating state directly and instead enforces the use of actions. This makes complete sense, but we think, whether to exclusively rely on actions to change the state, is a decision for the application developer and not one, that a library should dictate! Libraries are tools that developers use to solve their problems and thus they should be flexible enough to support the developer instead of restricting them.

## Installation

You know it:

```sh
npm i fleux
```

**fleux** comes with bundles in ESM, CJS and UMD formats, so you should be all set to use it in whatever environment or workflow you need to target.

## Basic Usage

The following shows a basic example of how you can use **fleux** to implement a counter:

```js
import React from 'react';
import { render } from 'react-dom';
import { connect, withState } from 'fleux';

// Write your component using a `store` prop.
const CounterDisplay = function ({store}) {
    return (
        <div>Counter is {store.counter}</div>
    )
}

// Use the `withState` HOC to bind store keys into your component.
const CounterDisplayWithState = withState()(CounterDisplay);

// Writing to the store will trigger updates in components that read the key that is written to.
const CounterButton = function ({store}) {
    return (
        <button onClick={() => store.counter = store.counter + 1}>Count</button>
    )
}

const CounterButtonWithState = withState()(CounterButton);

// Define your app and include the stateful components.
const App = function () {
    return (
        <div>
            <CounterDisplayWithState />
            <CounterButtonWithState />
        </div>
    )
}

// Connect a Component in your hierarchy to the store (optionally passing an initialization object)
const AppWithState = connect(App, {counter: 0});

// Render your app to the page and enjoy the stateful components in action!
render(<AppWithState />, document.getElementById('root'));
```

Using `withState` your components get a reference to a data store injected as a prop. When reading keys from the store object, it automatically subscribes your component to updates of that key.

### Selecting State Props

The example above showed a very basic use-case in which components don't specify upfront which store keys they will read: They simply use the `store` prop to access the data they need. If you want to directly add some specific store values to your component's props, you can do that by providing them to `withState`.

The following example shows how you can supply `withState` with a string to tell **fleux** to inject the store key of that name as a prop into your component.

```js
// Write your component as you would do if it were just taking props.
const CounterDisplay = function ({counter}) {
    return (
        <div>Counter is {counter}</div>
    )
}

// Use the `withState` HOC to bind store keys to your component.
const CounterDisplayWithState = withState('counter')(CounterDisplay);
```

You can also provide an array to select multiple keys or an object to rename keys:

```js
const Display = function ({foo, bar}) { /* ... */ }

// Provide an array of store keys to be injected into your component.
const DisplayWithState = withState(['foo', 'bar'])(Display);


const AnotherDisplay = function ({localName}) { /* ... */ }

// Use an object to rename store keys to local prop names.
const AnotherDisplayWithState = withState({localName: 'storeName'})(AnotherDisplay);
```

If the data selection of your component gets more complex, you can also provide a `selectStateProps` function to `withState`. That function will be called with the store and your component's own props, and is expected to return an object which maps prop names to values.

```js
const Display = function ({foo}) { /* ... */ }

const DisplayWithState = withState(
    (store, ownProps) => {
        return {
            foo: store.bar
        }
    }
)(Display);
```

Every time a store key that your `selectStateProps` accesses, it will be executed again. Its return value is compared its previous value and if it has changed, your component will be rerendered.

## Actions

A different way to manipulate store state without reading keys is by using actions. Actions allow you to describe more complex state transitions in a encapsulated way.

**fleux** stores have a `dispatch` method that allows you to execute actions on the store. Basically, you can pass any function to `dispatch`: The action you pass it will receive the store as an argument and its return value will be merged into the store:

```js
store.counter = 1;
const increment = ({counter}) => ({counter:counter+1});
store.dispatch(increment);
store.counter // 2
```

If you don't want to call dispatch (maybe because you want to pass down the action to a child component that is not connected to a store), you can use a store's `createAction` method. It allows you to bind an action to the store.

```js
store.counter = 1;
const increment = store.createAction(({counter}) => ({counter:counter+1}));
increment();
store.counter // 2
```

You can optionally name actions using `createAction` as well; this way, you technically don't need to bring the actions into scope anymore.

```js
store.counter = 1;
const increment = store.createAction('increment', ({counter}) => ({counter:counter+1}));
store.dispatch('increment');
store.counter // 2
```

### `prepareWriteActions`

If you want to write keys depending on their current value but don't want to use actions, you can use a little helper function that injects write actions into your component as props:

```js
import { prepareWriteActions, withState } from 'fleux';

withState(null, prepareWriteActins('foo'))(({setFoo}) => {
    setFoo(foo => foo+42); // Pass a mutator that takes the current value and returns the new value
})
```

### Bind Action Props

In case you want **fleux** to inject actions into your component's props, you can do that too. The second argument to `withState` can be used to provide actions to your component as props. You can provide an array which will be interpreted as a list of action names, or an object which will be interpreted as a mapping of action prop names to actions. You can also pass in a function which will be called with `dispatch` and is expected to return an object mapping action prop names to functions that call `dispatch`.

## Connecting a Store

In the examples above, there was no point at which the app was connected to a store. This is possible in **fleux** for brevity's sake, but not recommended as all the components will reuse the same default store.

You can and should connect a store to a subtree in your application using the `connect` method like this:

```js
const AppWithStore = connect(App, { counter: 0 })
```

**fleux** takes care of making the store that is connected to `App` available to all of its children.

You can provide default values for store keys in the object that is passed to `connect` as a second argument.

## Direct Store Access

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

If you want to mutate store values inside your components without receiving any updates for a value but don't want to use actions, you can instead use the store's `set` method: It takes the name of a store key and a function that will be called with the key's current value and its return value is written to that key.

```js
// store.set(key, currentValue => newValue)
store.set('counter', counter => counter+1)
store.set('counter', (counter, increment) => counter+increment, 5) // additional arguments are passed on
```

## Hooks

As an alternative to using the `withState` higher-order component you can use hooks to interact with stores.

### Accessing Store State

You can access the store from inside your component using the `useStore` hook:

```js
const Foo = function () {
    const { text } = useStore();
    return (
        <div>{text}</div>
    )
}
```

If you want to pass in a `selectStateProps` function, use the `useSelector` hook:

```js
const Foo = function () {
    const { numberOfTodos } = useSelector(({todos}) => ({numberOfTodos: todos.length}));
    return (
        <div># of Todos: {numberOfTodos}</div>
    )
}
```

### Accessing Actions

You can get access to the store's `dispatch` function using `useDispatch`:

```js
const Foo = function () {
    const dispatch = useDispatch();
    return (
        <button onClick={() => dispatch(({counter}) => ({counter:counter+1}))}>Increment</button>
    )
}
```

Or, you can directly access named actions from a store by calling `useActions`:

```js
createAction('increment', ({counter}) => ({counter:counter+1}));

const Foo = function () {
    const { increment } = useActions();
    return (
        <button onClick={() => increment()}>Increment</button>
    )
}
```

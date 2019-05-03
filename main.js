import * as React from 'react';
import ReactDOM from 'react-dom';
import { Provider, Store, useStore } from 'overstated';

class CounterStore extends Store {
    state = {
        counter: 0
    }
    incrementCounter = () => {
        return this.setState((state) => ({counter: state.counter+1}));
    }
}

const CounterDisplay = function () {

    const { counter } = useStore(CounterStore, (store) => ({
        counter: store.state.counter
    }));

    return (
        <div>{counter}</div>
    )
}

const CounterButton = function () {

    const { incrementCounter } = useStore(CounterStore, (store) => ({
        incrementCounter: store.incrementCounter
    }));

    return (
        <button onClick={() => incrementCounter()}>Count</button>
    )
}

const App = function () {
    return (
        <Provider>
            <CounterDisplay />
            <CounterButton />
        </Provider>
    )
}

document.addEventListener('DOMContentLoaded', function () {
    ReactDOM.render(<App />, document.getElementById('root'));
});

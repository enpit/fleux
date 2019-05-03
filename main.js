import * as React from 'react';
import ReactDOM from 'react-dom';
import { provide, subscribe } from 'alfa';

const CounterDisplay = function ({counter}) {
    return (
        <div>{counter}</div>
    )
}

const CounterDisplayWithSubscription = subscribe(CounterDisplay, ['counter']);

const CounterButton = function ({set, counter}) {
    return (
        <button onClick={() => set('counter', counter+1)}>Count</button>
    )
}

const CounterButtonWithSubscription = subscribe(CounterButton, ['set', 'counter'], ['counter']);

const App = function () {
    return (
        <div>
            <CounterDisplayWithSubscription />
            <CounterButtonWithSubscription />
        </div>
    )
}

const Root = provide(App, {
    counter: 0
})

document.addEventListener('DOMContentLoaded', function () {
    ReactDOM.render(<Root />, document.getElementById('root'));
});

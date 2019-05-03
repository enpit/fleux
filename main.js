import * as React from 'react';
import ReactDOM from 'react-dom';
import { action, inject, provide, subscribe } from 'alfa';

const incrementCounter = action(function ({set, counter}) {
    set('counter', counter+1);
}, ['set', 'counter'], ['counter']);

const CounterDisplay = function ({counter}) {
    return (
        <div>{counter}</div>
    )
}

const CounterDisplayWithSubscription = subscribe(CounterDisplay, ['counter']);

const CounterButton = function ({incrementCounter}) {
    return (
        <button onClick={() => incrementCounter()}>Count</button>
    )
}

const CounterButtonWithSubscription = inject(CounterButton, ['incrementCounter'], ['counter']);

const App = function () {
    return (
        <div>
            <CounterDisplayWithSubscription />
            <CounterButtonWithSubscription />
        </div>
    )
}

const Root = provide(App, {
    counter: 0,
    incrementCounter
})

document.addEventListener('DOMContentLoaded', function () {
    ReactDOM.render(<Root />, document.getElementById('root'));
});

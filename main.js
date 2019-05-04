import * as React from 'react';
import ReactDom from 'react-dom';

import { connect, withState } from './lib';

const CounterDisplay = function ({counter}) {
    return (
        <div>Counter is {counter}</div>
    )
}

const CounterDisplayWithState = withState('counter')(CounterDisplay);

const CounterButton = function ({setCounter}) {
    return (
        <button onClick={() => setCounter((counter) => counter+1)}>Count</button>
    )
}

const CounterButtonWithState = withState('counter')(CounterButton);

const App = function () {
    return (
        <div>
            <CounterDisplayWithState />
            <CounterButtonWithState />
            <Test test={'foo'} />
        </div>
    )
}

const Root = connect(App, {
    counter: 0
});

document.addEventListener('DOMContentLoaded', function () {
    ReactDom.render(<Root />, document.getElementById('root'));
});

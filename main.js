import * as React from 'react';
import ReactDom from 'react-dom';

import store, { withStore } from './store';

const CounterDisplay = function ({counter}) {
    return (
        <div>Counter is {counter}</div>
    )
}

const CounterDisplayWithStore = withStore(['counter'])(CounterDisplay);

// @withStore('counter')
// class CounterButton extends React.Component {
//     render() {
//         return (
//             <button onClick={() => this.props.setCounter((counter) => counter+1)}>Count</button>
//         )
//     }
// }

const CounterButton = function ({setCounter}) {
    return (
        <button onClick={() => setCounter((counter) => counter+1)}>Count</button>
    )
}

const CounterButtonWithStore = withStore([], ['counter'])(CounterButton);

console.log(store);

const App = function () {
    return (
        <div>
            <CounterDisplayWithStore />
            <CounterButtonWithStore />
        </div>
    )
}

document.addEventListener('DOMContentLoaded', function () {
    ReactDom.render(<App />, document.getElementById('root'));
});

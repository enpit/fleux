import * as React from 'react';
import ReactDom from 'react-dom';

const CounterDisplay = function ({counter}) {
    return (
        <div>Counter is {counter}</div>
    )
}

const CounterButton = function ({count}) {
    return (
        <button onClick={count}>Count</button>
    )
}

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            counter: 0
        }
    }

    render() {
        return (
            <div>
                <CounterDisplay counter={this.state.counter} />
                <CounterButton count={() => this.setState((state) => { return { counter: state.counter + 1 }; })} />
            </div>
        )
    }
}

document.addEventListener('DOMContentLoaded', function () {
    ReactDom.render(<App />, document.getElementById('root'));
});

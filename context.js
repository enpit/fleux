import * as React from 'react';
import ReactDom from 'react-dom';

import store, { withStore, } from './store';
// import { connect, withStore } from './lib';

const CounterDisplay = function ({counter}) {
    return (
        <div>Counter is {counter}</div>
    )
}

const CounterDisplayWithContext = function () {
    return (
        <CounterContext.Consumer>
            {counter => (<div>Counter is {counter}</div>) }
        </CounterContext.Consumer>
    )
}

const CounterContext = React.createContext(0);

class CounterDisplayWithContext2 extends React.Component {
    render() {
        return (
            <div>Counter is {this.context}</div>
        )
    }
}
CounterDisplayWithContext2.contextType = CounterContext;

const CounterButton = function ({setCounter}) {
    return (
        <button onClick={() => setCounter((counter) => counter+1)}>Count</button>
    )
}

// const CounterButtonWithStore = withStore([], ['counter'])(CounterButton);

// console.log(store);

const { connect, withContext } = (function () {

    var context, setContext, store;

    return {
        connect (Component, value) {
            context = React.createContext();
            return class extends React.Component {
                constructor(props) {
                    super(props);

                    this.state = {
                        ...value
                    }

                    store = value;

                    setContext = (value) => {
                        Object.assign(store, value);
                        this.setState({
                            ...value
                        })
                    }
                }
                render() {
                    return (
                        <context.Provider value={this.state}>
                            <Component />
                        </context.Provider>
                    )
                }
            }
        },
        withContext (Component) {
            return function () {
                return (
                    <context.Consumer>
                        {value => (<Component counter={value.counter} setCounter={(setCounter) => setContext({counter:setCounter(value.counter)})} />)}
                    </context.Consumer>
                )
            }
        }
    }
}());

const App = function () {
    return (
        <CounterContext.Provider value={0}>
            <div>
                <CounterDisplayWithContext />
                <CounterButton />
            </div>
        </CounterContext.Provider>
    )
}

const CounterDisplayWithContext3 = withContext(CounterDisplay);
const CounterButtonWithContext = withContext(CounterButton);

const UnrelatedDisplayWithContext = withContext(function () {
    // console.log('UnrelatedDisplay1 rendered')
    return (
        <div>Hello</div>
    )
});

const UnrelatedDisplay = function () {
    // console.log('UnrelatedDisplay2 rendered')
    return (
        <div>Hello</div>
    )
};

class UnrelatedDisplay2 extends React.PureComponent {
    render() {
        return (
            <div>Hello</div>
        )
    }
}

const App2 = function () {
    return (
        <div>
            <CounterDisplayWithContext3 />
            <CounterButtonWithContext />
            <UnrelatedDisplayWithContext />
            <UnrelatedDisplay />
            <UnrelatedDisplay2 />
        </div>
    )
}

const AppWithContext = connect(App2, {counter:0});


document.addEventListener('DOMContentLoaded', function () {
    ReactDom.render(<AppWithContext />, document.getElementById('root'));
});

import * as React from 'react';
import ReactDom from 'react-dom';

function completeAssign(target, ...sources) {
    sources.forEach(source => {
      let descriptors = Object.keys(source).reduce((descriptors, key) => {
        descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
        return descriptors;
      }, {});
      // by default, Object.assign copies enumerable Symbols too
      Object.getOwnPropertySymbols(source).forEach(sym => {
        let descriptor = Object.getOwnPropertyDescriptor(source, sym);
        if (descriptor.enumerable) {
          descriptors[sym] = descriptor;
        }
      });
      Object.defineProperties(target, descriptors);
    });
    return target;
  }

const store = (function () {

    const values = {};
    const callbacks = {};

    return {
        subscribe (name, callback) {
            if (typeof callbacks[name] === 'undefined') {
                callbacks[name] = [];
            }
            callbacks[name].push(callback)
        },
        unsubscribe (name, callback) {
            if (typeof callbacks[name] === 'undefined') {
                callbacks[name] = [];
            }
            callbacks[name].splice(callbacks[name].indexOf(callback), 1);
        },
        create (name, initialValue) {
            values[name] = initialValue;
            callbacks[name] = [];
            completeAssign(this, {
                get [name] () {
                    return values[name];
                },
                set [name] (value) {
                    values[name] = value;
                    callbacks[name].forEach((callback) => callback(value));
                }
            });
        }
    };
}());

store.create('counter', 0);

class CounterDisplay extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            counter: store.counter
        }

        this.updateCounter = this.updateCounter.bind(this);

    }

    componentDidMount() {
        store.subscribe('counter', this.updateCounter)
    }

    componentWillUnmount() {
        store.unsubscribe('counter', this.updateCounter)
    }

    updateCounter(counter) {
        this.setState({
            counter
        })
    }

    render() {
        return (
            <div>Counter is {this.state.counter}</div>
        )
    }
}

// const CounterDisplay = function ({counter}) {
//     return (
//         <div>Counter is {counter}</div>
//     )
// }

const CounterButton = function () {
    return (
        <button onClick={() => store.counter++}>Count</button>
    )
}

const App = function () {
    return (
        <div>
            <CounterDisplay />
            <CounterButton />
        </div>
    )
}

document.addEventListener('DOMContentLoaded', function () {
    ReactDom.render(<App />, document.getElementById('root'));
});

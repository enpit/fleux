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
                    callbacks[name].forEach((callback) => callback({[name]: value}));
                }
            });
        }
    };
}());

store.create('counter', 0);

const observe = function (...propNames) {
    return function (target, key, descriptor) {
        console.log(key);
    }
}

const withStore = function (Component, ...propNames) {
    
    return class extends React.Component {

        constructor(props) {
            super(props);

            this.state = {
                ...Object.fromEntries(propNames.map((propName) => [propName, store[propName]]))
            }

            this.updateState = this.updateState.bind(this);

        }

        componentDidMount() {
            propNames.forEach((propName) => store.subscribe(propName, this.updateState));
        }
    
        componentWillUnmount() {
            propNames.forEach((propName) => store.unsubscribe(propName, this.updateState));
        }
    
        updateState(data) {
            this.setState({
                ...data
            })
        }

        render() {
            return (
                <Component {...(this.state)} {...this.props} />
            )
        }

    }

}

const CounterDisplay = function ({counter}) {
    return (
        <div>Counter is {counter}</div>
    )
}

const CounterDisplayWithStore = withStore(CounterDisplay, 'counter');

const CounterButton = function () {
    return (
        <button onClick={() => store.counter++}>Count</button>
    )
}

const App = function () {
    return (
        <div>
            <CounterDisplayWithStore />
            <CounterButton />
        </div>
    )
}

document.addEventListener('DOMContentLoaded', function () {
    ReactDom.render(<App />, document.getElementById('root'));
});

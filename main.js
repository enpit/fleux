import * as React from 'react';
import ReactDom from 'react-dom';

import pascalCase from 'just-pascal-case';

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
                this.create(name);
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

const withStore = function (...propNames) {
    return function (Component) {
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
                    <Component {...(this.state)} {...this.props} {...Object.fromEntries(propNames.map((propName) => [ 'set' + pascalCase(propName), (value) => {
                        if (typeof value === 'function') {
                            store[propName] = value(store[propName]);
                        } else {
                            store[propName] = value
                        }
                    } ] )) } />
                )
            }

        }
    }
}

const CounterDisplay = function ({counter}) {
    return (
        <div>Counter is {counter}</div>
    )
}

const CounterDisplayWithStore = withStore('counter')(CounterDisplay);

@withStore('counter')
class CounterButton extends React.Component {
    render() {
        return (
            <button onClick={() => this.props.setCounter((counter) => counter+1)}>Count</button>
        )
    }
}

store.create('counter', 0);

// const CounterButtonWithStore = withStore('counter')(CounterButton);

console.log(store);

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

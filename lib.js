import * as React from 'react';
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

const readWriteHOC = function (store, readablePropNames = [], writeablePropNames = []) {
    return function (Component) {
        return class extends React.Component {

            constructor(props) {
                super(props);

                this.state = {
                    ...Object.fromEntries(readablePropNames.map((propName) => [propName, store[propName]]))
                }

                this.updateState = this.updateState.bind(this);

            }

            componentDidMount() {
                readablePropNames.forEach((propName) => store.subscribe(propName, this.updateState));
            }
        
            componentWillUnmount() {
                readablePropNames.forEach((propName) => store.unsubscribe(propName, this.updateState));
            }
        
            updateState(data) {
                this.setState({
                    ...data
                })
            }

            render() {
                return (
                    <Component {...(this.state)} {...this.props} {...Object.fromEntries(writeablePropNames.map((propName) => [ 'set' + pascalCase(propName), (value) => {
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

const createStore = function (initialValues) {

    const values = {};
    const callbacks = {};

    const store = {
        subscribe (name, callback) {
            if (typeof callbacks[name] === 'undefined') {
                this.create(name, this[name]);
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
        },
        withStore (...propNames) {
            if (propNames.every((propName) => typeof propName === 'string')) {
                return readWriteHOC(store, propNames, propNames);
            } else if (propNames.length <= 2 && propNames.every((propName) => Array.isArray(propName))) {
                return readWriteHOC(store, propNames[0], propNames[1] || []);
            }
        }
    };

    Object.entries(initialValues).forEach(([name, value]) => store.create(name, value));

    return store;
    
};

export { createStore };

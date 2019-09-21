import * as SYMBOLS from './symbols';
import preventWrites from './preventWrites';

const createStore = function (initialValues = {}) {

    const values = {};
    const callbacks = {};
    const namedProtoActions = {};
    const unnamedProtoActions = [];
    const namedActions = {};
    const unnamedActions = [];
    const store = {};

    const subscribe = function (name, callback) {

        if (typeof name !== 'string' && typeof name !== 'symbol') {
            throw new TypeError('Cannot subscribe to a key of type: ' + typeof name + '. Expecting \'string\' or \'symbol\'.')
        }

        if (typeof callbacks[name] === 'undefined') {
            create(name, this[name]);
        }
        callbacks[name].push(callback)
    };

    const unsubscribe = function (name, callback) {
        if (typeof callbacks[name] === 'undefined') {
            callbacks[name] = [];
        }
        callbacks[name].splice(callbacks[name].indexOf(callback), 1);
    };

    const create = function (name, initialValue) {

        if (typeof store[name] !== 'undefined') {
            if (typeof initialValue !== 'undefined' && initialValue !== store[name]) {
                throw Error(`Refusing to override existing value with initialization data for prop ${name}. This error is caused by providing an initial value to a key that already exists. This is likely to be a mistake. Please create the key without an initialization value.`);
            } else {
                values[name] = store[name];
            }
        } else {
            values[name] = initialValue;
        }

        callbacks[name] = [];
        Object.defineProperty(store, name, {
            get () {
                return values[name];
            },
            set (value) {
                const oldValue = values[name];
                values[name] = value;
                callbacks[name].forEach((callback) => callback({[name]: value}, {[name]: oldValue}));
            }
        });
    };

    const setValue = function (prop, setter, ...args) {
        return this[prop] = setter(this[prop], ...args);
    };

    const dispatch = function (action, ...args) {
        var _action;
        if (typeof action === 'string') {
            _action = namedProtoActions[action];
        } else if (action[SYMBOLS.ACTION_MARKER]) {
            return action(...args);
        } else if (typeof action === 'function') {
            _action = action;
        } else {
            throw new TypeError("Unable to dispatch action of type " + typeof action + ". Action must be a function or an action name string.")
        }

        const immutableStore = preventWrites(store, 'Refusing to write to store while dispatching.');
        const diff = _action(immutableStore, ...args);

        if (typeof diff !== 'object') {
            throw new TypeError("Unable to merge action return value of type " + typeof diff + " into the store. Return value should be a store slice object. (Did you accidentally dispatch a function that already dispatches internally?)");
        }

        Object.entries(diff).forEach(([key,value]) => proxy[key] = value);
        return true;
    };

    const createAction = function (...args) {
        var action, name, proto;
        if (typeof args[0] === 'string') {
            name = args[0];
            proto = args[1];
            namedProtoActions[name] = proto;
        } else {
            proto = args[0];
            unnamedProtoActions.push(proto);
        }

        action = function (...args) {
            return store.dispatch(proto, ...args);
        };

        Object.defineProperty(action, SYMBOLS.ACTION_MARKER, {
            enumerable: false,
            writable: false,
            value: true
        });

        if (typeof args[0] === 'string') {
            namedActions[name] = action;
        } else {
            unnamedActions.push(action);
        }

        return action;
    };

    const props = {};

    Object.defineProperties(store, {
        'subscribe': {
            enumerable: false,
            value: subscribe
        },
        'unsubscribe': {
            enumerable: false,
            value: unsubscribe
        },
        'create': {
            enumerable: false,
            value: create
        },
        'set': {
            enumerable: false,
            value: setValue
        },
        'dispatch': {
            enumerable: false,
            value: dispatch
        },
        'createAction': {
            enumerable: false,
            value: createAction
        },
        [SYMBOLS.STORE_MARKER]: {
            enumerable: false,
            writable: false,
            value: true
        },
        [SYMBOLS.STORE_GET]: {
            enumerable: false,
            value: function (prop, callback) {

                if (typeof callback !== 'undefined') {

                    if (typeof props[prop] === 'undefined') {
                        props[prop] = [callback];
                    }

                    if (!props.hasOwnProperty(prop)) {
                        return this[prop];
                    }

                    if (props[prop].indexOf(callback) === -1) {
                        props[prop].push(callback);
                    }

                }

                return this[prop];
            }
        },
        [SYMBOLS.STORE_GETACTIONS]: {
            enumerable: false,
            value: function () {
                return namedActions;
            }
        }
    });

    Object.entries(initialValues).forEach(([name, value]) => create(name, value));

    const handler = (function () {
        return {
            set: function (target, prop, value) {

                target[prop] = value;

                if (typeof props[prop] === 'undefined') {
                    return true;
                }

                for (let callback of props[prop]) {
                    callback(prop, value);
                }

                return true;
            }
        };
    }());

    const proxy = new Proxy(store, handler);

    return proxy;

};

const isStore = function (obj) {
    return obj[SYMBOLS.STORE_MARKER] === true
        && typeof obj.subscribe === 'function'
        && typeof obj.unsubscribe === 'function'
        && typeof obj.create === 'function';
}

export { createStore, isStore };

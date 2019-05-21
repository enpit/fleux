const createStore = function (initialValues = {}) {

    const values = {};
    const callbacks = {};
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

    Object.defineProperties(store, {
        subscribe: {
            enumerable: false,
            value: subscribe
        },
        unsubscribe: {
            enumerable: false,
            value: unsubscribe
        },
        create: {
            enumerable: false,
            value: create
        }
    });

    Object.entries(initialValues).forEach(([name, value]) => create(name, value));

    return store;

};

const isStore = function (obj) {
    return typeof obj.subscribe === 'function'
        && typeof obj.unsubscribe === 'function'
        && typeof obj.create === 'function';
}

export { createStore, isStore };

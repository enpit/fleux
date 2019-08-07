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
        },
        currentlyRenderingComponent: {
            enumerable: false,
            value: undefined,
            writable: true
        }
    });

    Object.entries(initialValues).forEach(([name, value]) => create(name, value));

    const handler = (function () {

        const props = {};

        return {
            get: function (target, prop) {
                const currentlyRenderingComponent = target.currentlyRenderingComponent;
                if (typeof currentlyRenderingComponent === 'undefined') {
                    return target[prop];
                }

                if (typeof props[prop] === 'undefined') {
                    props[prop] = [currentlyRenderingComponent];
                }

                if (props[prop].indexOf(currentlyRenderingComponent) === -1) {
                    props[prop].push(currentlyRenderingComponent);
                }

                return target[prop];
            },
            set: function (target, prop, value) {
                if (prop === 'currentlyRenderingComponent') { target.currentlyRenderingComponent = value; return true; }
                target[prop] = value;

                if (typeof props[prop] === 'undefined') {
                    return true;
                }

                for (let component of props[prop]) {
                    component.forceUpdate();
                }

                return true;
            }
        };
    }());

    return new Proxy(store, handler)

};

const isStore = function (obj) {
    return typeof obj.subscribe === 'function'
        && typeof obj.unsubscribe === 'function'
        && typeof obj.create === 'function';
}

export { createStore, isStore };

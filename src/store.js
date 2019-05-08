import completeAssign from './completeAssign';

const createStore = function (initialValues = {}) {

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
        }
    };

    Object.entries(initialValues).forEach(([name, value]) => store.create(name, value));

    return store;

};

const isStore = function (obj) {
    return typeof obj.subscribe === 'function'
        && typeof obj.unsubscribe === 'function'
        && typeof obj.create === 'function';
}

export { createStore, isStore };

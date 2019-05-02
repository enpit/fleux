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

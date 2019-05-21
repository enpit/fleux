const { createStore, isStore } = require('../dist/index.cjs');

describe('store', function () {
    describe('createStore', function () {
        it('should return an object', function () {
            const store = createStore();
            expect(store).toMatchObject({});
        });
        it('should initialize the store with provided data', function () {
            const store = createStore({foo:'bar'});
            expect(store.foo).toBe('bar');
        });
    });

    describe('store object', function () {
        it('should have a "create" property', function () {
            const store = createStore();
            expect(store).toHaveProperty('create');
        });

        it('should have a "subscribe" property', function () {
            const store = createStore();
            expect(store).toHaveProperty('subscribe');
        });

        it('should have an "unsubscribe" property', function () {
            const store = createStore();
            expect(store).toHaveProperty('unsubscribe');
        });

        it('should not have any enumerable properties', function () {
            const store = createStore();
            expect(Object.keys(store).length).toBe(0);
        });
    });

    describe('isStore', function () {
        it('should recognize legitimate store objects', function () {
            const store = createStore();
            expect(isStore(store)).toBe(true);
        });

        it('should recognize illegitimate store objects', function () {
            expect(isStore({})).toBe(false);
        });
    });

    describe('subscribe', function () {
        it('should accept a string as its first and a function as its second argument', function () {
            const store = createStore();
            expect(() => {
                return store.subscribe('foo', function () {
                    return;
                });
            }).not.toThrow();
        });

        it('should accept a symbol as its first and a function as its second argument', function () {
            const store = createStore();
            expect(() => {
                return store.subscribe(Symbol('foo'), function () {
                    return;
                });
            }).not.toThrow();
        });

        it('should not accept an object as its first argument', function () {
            const store = createStore();
            expect(() => {
                return store.subscribe({}, function () {
                    return;
                });
            }).toThrow(TypeError);
        });

        it('should not accept a function as its first argument', function () {
            const store = createStore();
            expect(() => {
                return store.subscribe(function () {}, function () {
                    return;
                });
            }).toThrow(TypeError);
        });

        it('should preserve a previously not properly created value', function () {
            const store = createStore();
            store.foo = 'bar';
            store.subscribe('foo', () => {});
            expect(store.foo).toBe('bar');
        });
    });

    describe('create', function () {
        it('should initialize a key that can be used like a normal property', function () {
            const store = createStore();
            store.create('foo');
            store.foo = 'bar';
            expect(store.foo).toBe('bar');
        });
        it('should preserve values on initializationy', function () {
            const store = createStore();
            store.foo = 'bar';
            store.create('foo');
            expect(store.foo).toBe('bar');
        });
        it('should initialize a key with the corresponding initialization value', function () {
            const store = createStore();
            store.create('foo', 'bar');
            expect(store.foo).toBe('bar');
        });
        it('should not allow overriding an existing value during initialization', function () {
            const store = createStore();
            store.foo = 'bar';
            expect(() => {
                store.create('foo', 'baz');
            }).toThrow();
        })
    })
});

describe('subscriptions', function () {
    describe('', function () {
        it('should call all callbacks that subscribed to a key when that key\'s value changes', function () {
            const store = createStore();
            var tmp = false;
            store.subscribe('foo', function () {
                tmp = true;
            });
            store.foo = 'bar';
            expect(tmp).toBe(true);
        });
        it('should call all callbacks for a key and provide an object containing the key and its new value', function () {
            const store = createStore();
            var tmp = false;
            store.subscribe('foo', function ({foo}) {
                tmp = foo;
            });
            store.foo = 'bar';
            expect(tmp).toBe('bar');
        });
        it('should call all callbacks for a key and provide an object containing the key and its new value as well as an object containing the key and its old value', function () {
            const store = createStore();
            var tmp = false;
            store.foo = 'baz'
            store.subscribe('foo', function (state, {foo}) {
                tmp = foo;
            });
            store.foo = 'bar';
            expect(tmp).toBe('baz');
        });
    });
});

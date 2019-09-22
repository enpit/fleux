const React = require('react');
const { act } = require('react-dom/test-utils');
const { mount, render, shallow } = require('enzyme');

const { createStore, connect, useActions, useDispatch, useSelector, useStore } = require('../dist/index.cjs');

describe('Hooks', function () {
    describe('`useDispatch`', function () {
        it('returns the current store\'s dispatch method', function () {
            const store = createStore();

            const Foo = () => {
                const dispatch = useDispatch();
                const action = store => ({bar: 'Hello World'});
                return (
                    <button onClick={() => dispatch(action)}>Click</button>
                )
            }

            const App = function () {
                return (
                    <Foo />
                )
            }

            const AppWithState = connect(App, store);

            var wrapper;

            act(() => {
                wrapper = mount(<AppWithState />);
            })

            act(() => {
                wrapper.find('button').props().onClick();
            })

            expect(store.bar).toBe('Hello World');
            wrapper.unmount();
        });
    });
    describe('`useActions`', function () {
        it('returns named actions of the current store', function () {
            const store = createStore();
            store.createAction('setText', () => ({bar: 'baz'}))

            const Foo = () => {
                const { setText } = useActions();
                return (
                    <button onClick={() => setText()}>Click</button>
                )
            }

            const App = function () {
                return (
                    <Foo />
                )
            }

            const AppWithState = connect(App, store);

            var wrapper;

            act(() => {
                wrapper = mount(<AppWithState />);
            })

            act(() => {
                wrapper.find('button').props().onClick();
            })

            expect(store.bar).toBe('baz');
            wrapper.unmount();
        });
        it('returns named actions of the current store that get passed the current state', function () {
            const store = createStore({counter:42});
            store.createAction('increment', ({counter}) => ({counter: counter+1}))

            const Foo = () => {
                const { increment } = useActions();
                return (
                    <button onClick={() => increment()}>Click</button>
                )
            }

            const App = function () {
                return (
                    <Foo />
                )
            }

            const AppWithState = connect(App, store);

            var wrapper;

            act(() => {
                wrapper = mount(<AppWithState />);
            })

            act(() => {
                wrapper.find('button').props().onClick();
            })

            expect(store.counter).toBe(43);
            wrapper.unmount();
        });
        it('returns named actions of the current store and passes additional arguments', function () {
            const store = createStore();
            store.createAction('setText', (_, text) => ({bar: text}))

            const Foo = () => {
                const { setText } = useActions();
                return (
                    <button onClick={() => setText('Hello World')}>Click</button>
                )
            }

            const App = function () {
                return (
                    <Foo />
                )
            }

            const AppWithState = connect(App, store);

            var wrapper;

            act(() => {
                wrapper = mount(<AppWithState />);
            })

            act(() => {
                wrapper.find('button').props().onClick();
            })

            expect(store.bar).toBe('Hello World');
            wrapper.unmount();
        });
    });
    describe('`useStore`', function () {
        it('returns a proxied reference to the current store', function () {
            const store = createStore();

            const Foo = () => {
                const store = useStore();
                return (
                    <button onClick={() => { store.bar = 'Hello World' }}>Click</button>
                )
            }

            const App = function () {
                return (
                    <Foo />
                )
            }

            const AppWithState = connect(App, store);

            var wrapper;

            act(() => {
                wrapper = mount(<AppWithState />);
            })

            act(() => {
                wrapper.find('button').props().onClick();
            })

            expect(store.bar).toBe('Hello World');
            wrapper.unmount();
        });
        it('causes the component to rerender after changes to keys that it reads', function () {
            const store = createStore({foo:'bar'});

            const Foo = () => {
                const store = useStore();
                return (
                    <div>{store.foo}</div>
                )
            }

            const App = function () {
                return (
                    <Foo />
                )
            }

            const AppWithState = connect(App, store);
            var wrapper;
            act(() => {
                wrapper = mount(<AppWithState />);
            })
            expect(wrapper.find(Foo).text()).toBe('bar');
            act(() => {
                store.foo = 'baz';
            })
            expect(wrapper.find(Foo).text()).toBe('baz');
            wrapper.unmount();
        });
    });
    describe('`useSelector`', function () {
        it('returns a state selection', function () {
            const store = createStore({foo:'bar'});

            const Foo = () => {
                const { myFoo } = useSelector(store => ({myFoo: store.foo}));
                return (
                    <div>{myFoo}</div>
                )
            }

            const App = function () {
                return (
                    <Foo />
                )
            }

            const AppWithState = connect(App, store);
            var wrapper;
            act(() => {
                wrapper = mount(<AppWithState />);
            })
            expect(wrapper.find(Foo).text()).toBe('bar');
            wrapper.unmount();
        });
        it('returns a state selection that gets updated when the relevant keys change', function () {
            const store = createStore({foo:'bar'});

            const Foo = () => {
                const { myFoo } = useSelector(store => ({myFoo: store.foo}));
                return (
                    <div>{myFoo}</div>
                )
            }

            const App = function () {
                return (
                    <Foo />
                )
            }

            const AppWithState = connect(App, store);
            var wrapper;
            act(() => {
                wrapper = mount(<AppWithState />);
            })
            expect(wrapper.find(Foo).text()).toBe('bar');
            act(() => {
                store.foo = 'baz';
            })
            expect(wrapper.find(Foo).text()).toBe('baz');
            wrapper.unmount();
        });
        it('returns a state selection that does not update when none of the relevant keys change', function () {
            const store = createStore({foo:'bar'});
            var numberOfRenders = 0;

            const Foo = () => {
                const { myFoo } = useSelector(store => ({myFoo: store.foo}));
                numberOfRenders++;
                return (
                    <div>{myFoo}</div>
                )
            }

            const App = function () {
                return (
                    <Foo />
                )
            }

            const AppWithState = connect(App, store);
            var wrapper;
            act(() => {
                wrapper = mount(<AppWithState />);
            })
            expect(wrapper.find(Foo).text()).toBe('bar');
            act(() => {
                store.bar = 'baz';
            })
            expect(wrapper.find(Foo).text()).toBe('bar');
            expect(numberOfRenders).toBe(1);
            wrapper.unmount();
        });
        it('returns a state selection that does not cause a rerender if its output does not change', function () {
            const store = createStore({foo: 'bar', bar: 'another bar'});
            var numberOfRenders = 0;

            const Foo = () => {
                const { myFoo } = useSelector(store => {
                    const tmp = store.bar;
                    return ({myFoo: store.foo});
                });
                numberOfRenders++;
                return (
                    <div>{myFoo}</div>
                )
            }

            const App = function () {
                return (
                    <Foo />
                )
            }

            const AppWithState = connect(App, store);
            var wrapper;
            act(() => {
                wrapper = mount(<AppWithState />);
            })
            expect(wrapper.find(Foo).text()).toBe('bar');
            act(() => {
                store.bar = 'anotherbaz';
            })
            expect(wrapper.find(Foo).text()).toBe('bar');
            expect(numberOfRenders).toBe(1);
            wrapper.unmount();
        });
    });
})

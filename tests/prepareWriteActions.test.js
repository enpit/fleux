const React = require('react');
const { mount, render, shallow } = require('enzyme');

const { createStore, prepareWriteActions, connect, withState } = require('../dist/index.cjs');

describe('`createMutators`', function () {
    it('returns an object with setter functions with the corresponding function names', function () {
        const setters = prepareWriteActions('foo', 'bar');
        expect(setters.setFoo).toBeFunction();
        expect(setters.setBar).toBeFunction();
    });

    it('returns setter functions that mutate the corresponding store key', function () {
        const store = createStore();
        const { setFoo } = prepareWriteActions('foo');
        const setter = () => 'bar';
        store.dispatch(setFoo, setter);
        expect(store.foo).toBe('bar');
    });

    it('returns setter functions that receives the key\'s current value', function () {
        const store = createStore({foo: 42});
        const { setFoo } = prepareWriteActions('foo');
        const setter = foo => foo+1;
        store.dispatch(setFoo, setter);
        expect(store.foo).toBe(43);
    });

    it('returns setter functions that pass additional arguments to the actual setter', function () {
        const store = createStore();
        const { setFoo } = prepareWriteActions('foo');
        const setter = (foo, value) => value;
        store.dispatch(setFoo, setter, 'bazzz');
        expect(store.foo).toBe('bazzz');
    });

    it('is wrapped by `bindActionProps` such that the resulting prop just takes a setter', function () {
        const store = createStore({foo:'bar'});
        const C = withState(null, prepareWriteActions('foo'))(({setFoo}) => {
            setFoo(() => 'bazzz');
            return (<span>Hello World</span>);
        });

        const App = () => (<C />);
        const AppWithState = connect(App, store);
        const wrapper = render(<AppWithState />);
        expect(store.foo).toBe('bazzz');
    });

    it('is wrapped by `bindActionProps` such that the resulting prop just takes a setter that is called with the current key value', function () {
        const store = createStore({foo:42});
        const C = withState(null, prepareWriteActions('foo'))(({setFoo}) => {
            setFoo(foo => foo+1);
            return (<span>Hello World</span>);
        });

        const App = () => (<C />);
        const AppWithState = connect(App, store);
        const wrapper = render(<AppWithState />);
        expect(store.foo).toBe(43);
    });

    it('is wrapped by `bindActionProps` such that the resulting prop just takes a setter and additional arguments', function () {
        const store = createStore({foo:'bar'});
        const C = withState(null, prepareWriteActions('foo'))(({setFoo}) => {
            setFoo((foo, text) => text, 'bazzz');
            return (<span>Hello World</span>);
        });

        const App = () => (<C />);
        const AppWithState = connect(App, store);
        const wrapper = render(<AppWithState />);
        expect(store.foo).toBe('bazzz');
    });
});

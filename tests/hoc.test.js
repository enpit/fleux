const React = require('react');
const { mount, render, shallow } = require('enzyme');

const { createStore, connect, withState } = require('../dist/index.cjs');

describe('connect', function () {
    it('should accept a component and an object', function () {

        const App = function () {
            return (
                <div>Foo</div>
            )
        }

        expect(() => {
            const AppWithState = connect(App, {});
        }).not.toThrow();

    });

    it('should return a component that can be rendered as usual', function () {
        const App = function () {
            return (
                <div>Foo</div>
            )
        }

        const AppWithState = connect(App, {});
        const wrapper = render(<AppWithState />);
        expect(wrapper.text()).toBe('Foo');
    });
});

describe('withState', function () {
    it('', function () {

        const Foo = function () {
            return (
                <div>Foo</div>
            )
        }

        const FooWithState = withState('nothing')(Foo);

        const App = function () {
            return (
                <FooWithState />
            )
        }

        const AppWithState = connect(App, {});
        const wrapper = render(<AppWithState />);
        expect(wrapper.text()).toBe('Foo');
    });
});

describe('global state', function () {
    it('is available in stateful components in a connected subtree', function () {
        const Foo = function ({foo}) {
            return (
                <div>{foo}</div>
            )
        }

        const FooWithState = withState('foo')(Foo);

        const App = function () {
            return (
                <FooWithState />
            )
        }

        const AppWithState = connect(App, {foo: 'bar'});
        const wrapper = render(<AppWithState />);
        expect(wrapper.text()).toBe('bar');
    });

    it('is updated and stateful components get rerendered on changes', function () {
        const Foo = function ({foo}) {
            return (
                <div>{foo}</div>
            )
        }

        const FooWithState = withState('foo')(Foo);

        const App = function () {
            return (
                <FooWithState />
            )
        }

        const store = createStore({foo: 'bar'});

        const AppWithState = connect(App, store);
        const wrapper = mount(<AppWithState />);
        store.foo = 'bazzz';
        expect(wrapper.find(Foo).text()).toBe('bazzz');
        wrapper.unmount();
    });

    it('should inject a setter into stateful components in a connected substree', function () {
        const Foo = function ({foo, setFoo}) {
            return (
                <div>{foo}</div>
            )
        }

        const FooWithState = withState('foo')(Foo);

        const App = function () {
            return (
                <FooWithState />
            )
        }

        const AppWithState = connect(App, {foo: 'bar'});
        const wrapper = mount(<AppWithState />);
        const setFooProp = wrapper.find(Foo).prop('setFoo');
        expect(setFooProp).toBeDefined();
        expect(setFooProp).toBeFunction();

        setFooProp('bazzz');
        expect(wrapper.find(Foo).text()).toBe('bazzz');
    });

    it('should pass on any props the parent passes to a stateful components', function () {
        const Foo = function ({foo, setFoo, answer}) {
            return (
                <div>{answer}</div>
            )
        }

        const FooWithState = withState('foo')(Foo);

        const App = function () {
            return (
                <FooWithState answer={42} />
            )
        }

        const AppWithState = connect(App, {foo: 'bar'});
        const wrapper = mount(<AppWithState />);
        expect(wrapper.find(Foo).text()).toBe('42');
    });
});

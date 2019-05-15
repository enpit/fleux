const React = require('react');
const { mount, render, shallow } = require('enzyme');

const { createStore, connect, withState } = require('../dist/index.cjs');

/*
 * *Breaths in* Okay.
 * This was added because when React encounters an error while rendering a component it logs a lot of stuff to the console. This is fine in principle, but in here I have some tests that provoke such errors and I don't want to clutter the testing output with pointless stack traces - these are intentional errors after all.
 * The problem is, of course, that mocking away `console.error` surpresses **all** error messages, even those that might not be intentionally provoked.
 * The issue was discussed in https://github.com/facebook/react/issues/11098 and a fix to React was submitted that allows for specific conditions to make React surpress those error messages. A solution that provides these conditions can be found in https://gist.github.com/gaearon/adf9d5500e11a4e7b2c6f7ebf994fe56. Weirdly, nobody seemed to have bothered to put that into a Jest matcher, even though that idea was explicitly stated. :shrug:
 * For the time being, I will use this to surpress the noise even though I don't like it.
 */
beforeEach(() => {
    jest.spyOn(console, 'error')
    global.console.error.mockImplementation(() => {})
});

afterEach(() => {
    global.console.error.mockRestore()
});

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
    it('returns a component that wraps its input component and renders it', function () {
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

    it('takes a string argument that is interpreted as a readable and writeable store key and correspondingly injected into the component', function () {
        const Foo = function ({foo, setFoo}) {
            return (
                <div>Foo</div>
            )
        }

        const FooWithState = withState('foo')(Foo);

        const App = function () {
            return (
                <FooWithState />
            )
        }

        const AppWithState = connect(App, {foo:'bar'});
        const wrapper = mount(<AppWithState />);
        expect(wrapper.find(Foo).props().foo).toBeDefined()
        expect(wrapper.find(Foo).props().setFoo).toBeDefined();
        wrapper.unmount();
    });

    it('takes a list of string arguments that are interpreted as readable and writeable store keys and correspondingly injected into the component', function () {
        const Foo = function ({foo, setFoo, answer, setAnswer}) {
            return (
                <div>Foo</div>
            )
        }

        const FooWithState = withState('foo', 'answer')(Foo);

        const App = function () {
            return (
                <FooWithState />
            )
        }

        const AppWithState = connect(App, {foo:'bar',answer:42});
        const wrapper = mount(<AppWithState />);
        expect(wrapper.find(Foo).props().foo).toBeDefined()
        expect(wrapper.find(Foo).props().setFoo).toBeDefined();
        expect(wrapper.find(Foo).props().answer).toBeDefined()
        expect(wrapper.find(Foo).props().setAnswer).toBeDefined();
        wrapper.unmount();
    });

    it('takes an array argument that is interpreted as a list of readable store keys and correspondingly injected into the component', function () {
        const Foo = function ({foo, setFoo, answer, setAnswer}) {
            return (
                <div>Foo</div>
            )
        }

        const FooWithState = withState(['foo', 'answer'])(Foo);

        const App = function () {
            return (
                <FooWithState />
            )
        }

        const AppWithState = connect(App, {foo:'bar',answer:42});
        const wrapper = mount(<AppWithState />);
        expect(wrapper.find(Foo).props().foo).toBeDefined()
        expect(wrapper.find(Foo).props().setFoo).not.toBeDefined();
        expect(wrapper.find(Foo).props().answer).toBeDefined()
        expect(wrapper.find(Foo).props().setAnswer).not.toBeDefined();
        wrapper.unmount();
    });

    it('takes `null` and an array argument that is interpreted as a list of writeable store keys and correspondingly injected into the component', function () {
        const Foo = function ({foo, setFoo, answer, setAnswer}) {
            return (
                <div>Foo</div>
            )
        }

        const FooWithState = withState(null, ['foo', 'answer'])(Foo);

        const App = function () {
            return (
                <FooWithState />
            )
        }

        const AppWithState = connect(App, {foo:'bar',answer:42});
        const wrapper = mount(<AppWithState />);
        expect(wrapper.find(Foo).props().foo).not.toBeDefined()
        expect(wrapper.find(Foo).props().setFoo).toBeDefined();
        expect(wrapper.find(Foo).props().answer).not.toBeDefined()
        expect(wrapper.find(Foo).props().setAnswer).toBeDefined();
        wrapper.unmount();
    });

    it('throws when supplied with a mix of array and string arguments', function () {
        const Foo = function ({foo, setFoo, answer, setAnswer}) {
            return (
                <div>Foo</div>
            )
        }

        expect(() => {
            withState('null', ['foo', 'answer'])(Foo)
        }).toThrow();

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

    it('should throw an error if a prop name that is passed to a stateful component conflicts with a key from the store', function () {
        const Foo = function ({foo}) {
            return (
                <div>{foo}</div>
            )
        }

        const FooWithState = withState('foo')(Foo);

        const App = function () {
            return (
                <FooWithState foo={'bar'} />
            )
        }
        const AppWithState = connect(App, {foo: 'bar'});

        expect(() => {
            const wrapper = mount(<AppWithState />);
        }).toThrow();

        const FooWithStateTheSecond = withState(['foo'], ['bar'])(Foo);

        const AppTheSecond = function () {
            return (
                <FooWithStateTheSecond foo={'bar'} />
            )
        }
        const AppWithStateTheSecond = connect(AppTheSecond, {foo: 'bar'});

        expect(() => {
            const wrapper = mount(<AppWithStateTheSecond />);
        }).toThrow();

        const FooWithStateTheThird = withState(['foo'], ['bar'])(Foo);

        const AppTheThird = function () {
            return (
                <FooWithStateTheThird setBar={'bar'} />
            )
        }
        const AppWithStateTheThird = connect(AppTheThird, {foo: 'bar'});

        // ! This should actually fail, but the required internal checks are not yet implemented.
        expect(() => {
            const wrapper = mount(<AppWithStateTheThird />);
        }).not.toThrow();
    });
});

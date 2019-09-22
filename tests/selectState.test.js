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

describe('`selectStateProps`', function () {
    describe('in string form', function () {
        it('injects given props into a component', function () {
            const store = createStore({
                foo: 'bar'
            });

            const Foo = withState('foo')(({foo}) => (<div>{foo}</div>));

            const App = () => (<Foo />);
            const AppWithState = connect(App, store);
            const wrapper = mount(<AppWithState />);
            expect(wrapper.find(Foo).text()).toBe('bar');
            wrapper.unmount();
        });

        it('rerenders the component for changes to a key', function () {
            const store = createStore({
                foo: 'bar'
            });

            const Foo = withState('foo')(({foo}) => (<div>{foo}</div>));

            const App = () => (<Foo />);
            const AppWithState = connect(App, store);
            const wrapper = mount(<AppWithState />);
            store.foo = 'bazzz';
            expect(wrapper.find(Foo).text()).toBe('bazzz');
            wrapper.unmount();
        });
    });

    describe('in array form', function () {
        it('injects given props into a component', function () {
            const store = createStore({
                foo: 'bar'
            });

            const Foo = withState(['foo'])(({foo}) => (<div>{foo}</div>));

            const App = () => (<Foo />);
            const AppWithState = connect(App, store);
            const wrapper = mount(<AppWithState />);
            expect(wrapper.find(Foo).text()).toBe('bar');
            wrapper.unmount();
        });

        it('rerenders the component for changes to a key', function () {
            const store = createStore({
                foo: 'bar'
            });

            const Foo = withState(['foo'])(({foo}) => (<div>{foo}</div>));

            const App = () => (<Foo />);
            const AppWithState = connect(App, store);
            const wrapper = mount(<AppWithState />);
            store.foo = 'bazzz';
            expect(wrapper.find(Foo).text()).toBe('bazzz');
            wrapper.unmount();
        });
    });

    describe('in object form', function () {
        it('injects props with the specified names into a component', function () {
            const store = createStore({
                foo: 'bar'
            });

            const Foo = withState({_foo: 'foo'})(({_foo}) => (<div>{_foo}</div>));

            const App = () => (<Foo />);
            const AppWithState = connect(App, store);
            const wrapper = mount(<AppWithState />);
            expect(wrapper.find(Foo).text()).toBe('bar');
            wrapper.unmount();
        });

        it('rerenders the component for changes to a key', function () {
            const store = createStore({
                foo: 'bar'
            });

            const Foo = withState({_foo: 'foo'})(({_foo}) => (<div>{_foo}</div>));

            const App = () => (<Foo />);
            const AppWithState = connect(App, store);
            const wrapper = mount(<AppWithState />);
            store.foo = 'bazzz';
            expect(wrapper.find(Foo).text()).toBe('bazzz');
            wrapper.unmount();
        });
    });

    describe('in function form', function () {
        it('receives the store as an argument', function () {
            const store = createStore({
                foo: 'bar'
            });

            var check;

            const Foo = withState((store) => {
                check = store.foo;
                return ({});
            })(() => (<div>Hello World</div>));

            const App = () => (<Foo />);
            const AppWithState = connect(App, store);
            const wrapper = render(<AppWithState />);
            expect(check).toBe('bar');
        });

        it('receives the component\'s own props as an argument', function () {
            const store = createStore();

            var check;

            const Foo = withState((store, ownProps) => {
                check = ownProps.foo;
                return ({});
            })(() => (<div>Hello World</div>));

            const App = () => (<Foo foo="bar" />);
            const AppWithState = connect(App, store);
            const wrapper = render(<AppWithState />);
            expect(check).toBe('bar');
        });

        it('injects the specified props into a component', function () {
            const store = createStore({
                foo: 'bar'
            });

            const Foo = withState(({foo}) => ({_foo: foo}))(({_foo}) => (<div>{_foo}</div>));

            const App = () => (<Foo />);
            const AppWithState = connect(App, store);
            const wrapper = mount(<AppWithState />);
            expect(wrapper.find(Foo).text()).toBe('bar');
            wrapper.unmount();
        });

        it('rerenders the component for changes to a prop', function () {
            const store = createStore({
                foo: 'bar'
            });

            const Foo = withState(({foo}) => ({_foo: foo}))(({_foo}) => (<div>{_foo}</div>));

            const App = () => (<Foo />);
            const AppWithState = connect(App, store);
            const wrapper = mount(<AppWithState />);
            store.foo = 'bazzz';
            expect(wrapper.find(Foo).text()).toBe('bazzz');
            wrapper.unmount();
        });

        it('does not execute on key changes for keys that it does not read', function () {
            const store = createStore({
                foo: 'bar'
            });

            var counter = 0;

            const Foo = withState(() => {
                counter++;
                return ({_foo: 'notchanging'});
            })(({_foo}) => (<div>{_foo}</div>));

            const App = () => (<Foo />);
            const AppWithState = connect(App, store);
            const wrapper = mount(<AppWithState />);
            store.foo = 'bazzz';
            expect(wrapper.find(Foo).text()).toBe('notchanging');
            expect(counter).toBe(1);
            wrapper.unmount();
        });

        it('does not rerender the component for changes to a key that do not result in changes to a prop', function () {
            const store = createStore({
                foo: 'bar'
            });

            var counter = 0;

            const Foo = withState(({foo}) => {
                const tmp = foo;
                return ({_foo: 'notchanging'});
            })(({_foo}) => {
                counter++;
                return (<div>{_foo}</div>);
            });

            const App = () => (<Foo />);
            const AppWithState = connect(App, store);
            const wrapper = mount(<AppWithState />);
            store.foo = 'bazzz';
            expect(wrapper.find(Foo).text()).toBe('notchanging');
            expect(counter).toBe(1);
            wrapper.unmount();
        });

        it('does not rerender the component for changes to a key that do not result in changes to a prop', function () {
            const store = createStore({
                foo: 'bar',
                answer: 42
            });
            var counter = 0;

            const Foo = withState(({foo, answer}) => {
                const tmp = answer;
                return ({foo});
            })(({foo}) => {
                counter++;
                return (<div>{foo}</div>);
            });

            const App = () => (<Foo />);
            const AppWithState = connect(App, store);
            const wrapper = mount(<AppWithState />);
            store.answer = 43;
            expect(wrapper.find(Foo).text()).toBe('bar');
            expect(counter).toBe(1);
            wrapper.unmount();
        });

        it('throws when the store is mutated inside of it', function () {
            const store = createStore({
                foo: 'bar'
            });

            const Foo = withState((store) => {
                store.foo = 'bazzz';
                return ({});
            })(() => (<div>Hello World</div>));

            const App = () => (<Foo />);
            const AppWithState = connect(App, store);
            expect(() => {
                const wrapper = render(<AppWithState />);
            }).toThrow();
        });
    });
});

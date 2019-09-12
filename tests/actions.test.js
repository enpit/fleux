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

describe('actions', function () {
    describe('without `bindActionProps`', function () {
        describe('while accessing current state', function () {
            it('can be dirty action functions', function () {
                const store = createStore({
                    counter: 42
                });

                const increment = store => { store.counter = store.counter + 1 };
                const Button = withState()(({store}) => (<button onClick={() => increment(store)}>Increment</button>));

                const App = () => (<Button />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('button').props().onClick();
                expect(store.counter).toBe(43);
                wrapper.unmount();
            });

            it('can dispatch plain functions', function () {
                const store = createStore({
                    counter: 42
                });

                const increment = (({counter}) => ({counter:counter+1}));
                const Button = withState()(({store}) => (<button onClick={() => store.dispatch(increment)}>Increment</button>));

                const App = () => (<Button />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('button').props().onClick();
                expect(store.counter).toBe(43);
                wrapper.unmount();
            });

            it('can dispatch actions created by `createAction`', function () {
                const store = createStore({
                    counter: 42
                });

                const increment = store.createAction((({counter}) => ({counter:counter+1})));
                const Button = withState()(() => (<button onClick={() => increment()}>Increment</button>));

                const App = () => (<Button />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('button').props().onClick();
                expect(store.counter).toBe(43);
                wrapper.unmount();
            });

            it('can dispatch named actions', function () {
                const store = createStore({
                    counter: 42
                });

                store.createAction('increment', (({counter}) => ({counter:counter+1})));
                const Button = withState()(({store}) => (<button onClick={() => store.dispatch('increment')}>Increment</button>));

                const App = () => (<Button />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('button').props().onClick();
                expect(store.counter).toBe(43);
                wrapper.unmount();
            });
        });

        describe('while passing on arguments', function () {
            it('can dispatch plain functions', function () {
                const store = createStore({
                    text: ''
                });

                const setText = (_,text) => ({text});
                const TF = withState()(({store}) => (<input type="text" onChange={e => store.dispatch(setText, e.target.value)} />));

                const App = () => (<TF />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('input').props().onChange({target:{value:'foo'}});
                expect(store.text).toBe('foo');
                wrapper.unmount();
            });

            it('can dispatch actions created by `createAction`', function () {
                const store = createStore({
                    text: ''
                });

                const setText = store.createAction((_,text) => ({text}));
                const TF = withState()((() => (<input type="text" onChange={e => setText(e.target.value)}/>)));

                const App = () => (<TF />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('input').props().onChange({target:{value:'foo'}});
                expect(store.text).toBe('foo');
                wrapper.unmount();
            });

            it('can dispatch named actions', function () {
                const store = createStore({
                    text: ''
                });

                store.createAction('setText', (_,text) => ({text}));
                const TF = withState()(({store}) => (<input type="text" onChange={e => store.dispatch('setText', e.target.value)} />));

                const App = () => (<TF />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('input').props().onChange({target:{value:'foo'}});
                expect(store.text).toBe('foo');
                wrapper.unmount();
            });

            it('can dispatch plain functions', function () {
                const store = createStore({
                    text: ''
                });

                const setText = (_,text) => ({text});
                const TF = withState()(({dispatch}) => (<input type="text" onChange={e => dispatch(setText, e.target.value)} />));

                const App = () => (<TF />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('input').props().onChange({target:{value:'foo'}});
                expect(store.text).toBe('foo');
                wrapper.unmount();
            });

            it('can dispatch actions created by `createAction`', function () {
                const store = createStore({
                    text: ''
                });

                store.createAction('setText', (_,text) => ({text}));
                const TF = withState()(({dispatch}) => (<input type="text" onChange={e => dispatch('setText', e.target.value)} />));

                const App = () => (<TF />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('input').props().onChange({target:{value:'foo'}});
                expect(store.text).toBe('foo');
                wrapper.unmount();
            });
        });
    });

    describe('with `bindActionProps`', function () {
        describe('while accessing current state', function () {
            it('can dispatch actions created by `createAction`', function () {
                const store = createStore({
                    counter: 42
                });

                const increment = store.createAction((({counter}) => ({counter:counter+1})));
                const Button = withState(null, {increment})(({increment}) => (<button onClick={() => increment()}>Increment</button>));

                const App = () => (<Button />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('button').props().onClick();
                expect(store.counter).toBe(43);
                wrapper.unmount();
            });

            it('can dispatch named actions', function () {
                const store = createStore({
                    counter: 42
                });

                store.createAction('increment', (({counter}) => ({counter:counter+1})));
                const Button = withState(null, ['increment'])(({increment}) => (<button onClick={() => increment()}>Increment</button>));

                const App = () => (<Button />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('button').props().onClick();
                expect(store.counter).toBe(43);
                wrapper.unmount();
            });

            it('can dispatch actions defined in `bindAction`\'s function form', function () {
                const store = createStore({
                    counter: 42
                });

                const Button = withState(null, (dispatch) => ({_increment:() => dispatch(({counter}) => ({counter:counter+1}))}))(({_increment}) => (<button onClick={() => _increment()}>Increment</button>));

                const App = () => (<Button />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('button').props().onClick();
                expect(store.counter).toBe(43);
                wrapper.unmount();
            });

            it('can dispatch actions defined in `bindAction`\'s function form and created by `createAction`', function () {
                const store = createStore({
                    counter: 42
                });

                const increment = store.createAction((({counter}) => ({counter:counter+1})));
                const Button = withState(null, () => ({_increment:() => increment()}))(({_increment}) => (<button onClick={() => _increment()}>Increment</button>));

                const App = () => (<Button />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('button').props().onClick();
                expect(store.counter).toBe(43);
                wrapper.unmount();
            });
        });

        describe('while passing on arguments', function () {
            it('can dispatch plain functions', function () {
                const store = createStore({
                    text: ''
                });

                const setText = (_,text) => ({text});
                const TF = withState(null, {_setText:setText})(({_setText}) => (<input type="text" onChange={e => _setText(e.target.value)} />));

                const App = () => (<TF />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('input').props().onChange({target:{value:'foo'}});
                expect(store.text).toBe('foo');
                wrapper.unmount();
            });

            it('can dispatch actions created by `createAction`', function () {
                const store = createStore({
                    text: ''
                });

                const setText = store.createAction((_,text) => ({text}));
                const TF = withState(null,{_setText: setText})(({_setText}) => (<input type="text" onChange={e => _setText(e.target.value)} />));

                const App = () => (<TF />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('input').props().onChange({target:{value:'foo'}});
                expect(store.text).toBe('foo');
                wrapper.unmount();
            });

            it('can dispatch actions defined in `bindAction`\'s function form', function () {
                const store = createStore({
                    text: ''
                });

                const TF = withState(null, (dispatch) => ({setText:(text) => dispatch((_,text) => ({text}), text)}))(({setText}) => (<input type="text" onChange={e => setText(e.target.value)} />));

                const App = () => (<TF />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('input').props().onChange({target:{value:'foo'}});
                expect(store.text).toBe('foo');
                wrapper.unmount();
            });

            it('can dispatch actions defined in `bindAction`\'s function form and created by `createAction`', function () {
                const store = createStore({
                    text: ''
                });

                const setText = store.createAction((_,text) => ({text}));
                const TF = withState(null, (dispatch) => ({_setText:(text) => setText(text)}))(({_setText}) => (<input type="text" onChange={e => _setText(e.target.value)} />));

                const App = () => (<TF />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('input').props().onChange({target:{value:'foo'}});
                expect(store.text).toBe('foo');
                wrapper.unmount();
            });

            it('can dispatch named actions', function () {
                const store = createStore({
                    text: ''
                });

                store.createAction('setText', (_,text) => ({text}));
                const TF = withState(null,['setText'])((({setText}) => (<input type="text" onChange={e => setText(e.target.value)}/>)));

                const App = () => (<TF />);
                const AppWithState = connect(App, store);
                const wrapper = mount(<AppWithState />);
                wrapper.find('input').props().onChange({target:{value:'foo'}});
                expect(store.text).toBe('foo');
                wrapper.unmount();
            });
        });
    });
});

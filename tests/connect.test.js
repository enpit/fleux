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

    it('should return a component that passes through props to the original component', function () {
        const App = function ({foo}) {
            return (
                <div>{foo}</div>
            )
        }

        const AppWithState = connect(App, {});
        const wrapper = render(<AppWithState foo="bar" />);
        expect(wrapper.text()).toBe('bar');
    });

    it('should throw when being called without a store object', function () {
        const App = function ({foo}) {
            return (
                <div>{foo}</div>
            )
        }

        expect(() => {
            const AppWithState = connect(App);
        }).toThrow();
    });
});

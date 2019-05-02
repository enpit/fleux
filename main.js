import * as React from 'react';
import ReactDom from 'react-dom';

// import store, { withStore, } from './store';
import { connect, createStore, withState } from './lib';

// const { connect, withContext, withState, withStore } = (function () {

//     var context, setContext, store;

//     return {
//         connect (Component, value) {
//             context = React.createContext();
//             return class extends React.Component {
//                 render() {
//                     return (
//                         <context.Provider value={value}>
//                             <Component />
//                         </context.Provider>
//                     )
//                 }
//             }
//         },
//         withContext (Component) {
//             return function () {
//                 return (
//                     <context.Consumer>
//                         {value => (<Component context={value} />)}
//                     </context.Consumer>
//                 )
//             }
//         },
//         withStore (store, ...propNames) {
//             if (propNames.every((propName) => typeof propName === 'string')) {
//                 return readWriteHOC(store, propNames, propNames);
//             } else if (propNames.length <= 2 && propNames.every((propName) => Array.isArray(propName))) {
//                 return readWriteHOC(store, propNames[0], propNames[1] || []);
//             }
//         },
//         withState (...propNames) {
//             return function (Component) {
//                 return function () {
//                     const ComponentWithContext = withContext(function ({context}) {
//                         const ComponentWithStore = withStore(context, ...propNames)(Component);
//                         return (
//                             <ComponentWithStore />
//                         )
//                     });
//                     return (
//                         <ComponentWithContext />
//                     )
//                 }
//             }
//         }
//     }
// }());

const CounterDisplay = function ({counter}) {
    return (
        <div>Counter is {counter}</div>
    )
}

// const CounterDisplayWithStore = withStore(['counter'])(CounterDisplay);
const CounterDisplayWithState = withState('counter')(CounterDisplay);

const CounterButton = function ({setCounter}) {
    return (
        <button onClick={() => setCounter((counter) => counter+1)}>Count</button>
    )
}

// const CounterButtonWithStore = withStore([], ['counter'])(CounterButton);
const CounterButtonWithState = withState('counter')(CounterButton);

// console.log(store);

const Test = function (props) {
    console.log(props);
    return (
        <div>Hello</div>
    )
}

const App = function () {
    return (
        <div>
            <CounterDisplayWithState />
            <CounterButtonWithState />
            <Test test={'foo'} />
        </div>
    )
}

const Root = connect(App, createStore({
    counter: 47
}));

document.addEventListener('DOMContentLoaded', function () {
    ReactDom.render(<Root />, document.getElementById('root'));
});

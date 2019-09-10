import * as React from 'react';
import ReactDom from 'react-dom';

import { createStore, connect, withState } from '../../src';

// const App = function () {
//     return (
//         <div>
//             <CounterDisplayWithState test={'bazzzz'} />
//             <CounterButtonWithState />
//         </div>
//     )
// }

// const store = {
//     counter: 0
// };

// const Root = connect(App, store);

// const CounterDisplay = function ({counter, test}) {
//     return (
//         <div>Counter is {counter} and test is {test}</div>
//     )
// }

// const CounterDisplayWithState = withState(['counter', 'bar'])(CounterDisplay);

// const CounterButton = function ({setCounter}) {
//     return (
//         <button onClick={() => setCounter(counter => (counter || 0)+1)}>Count</button>
//     )
// }

// const CounterButtonWithState = withState(null, ['counter'])(CounterButton);

/***********************/

// const Foo = function ({store}) {
//     const { foo } = store;
//     return (
//         <div>{foo}</div>
//     )
// }

// const FooWithState = withState(Foo);

// const App = function () {
//     return (
//         <>
//             <FooWithState />
//         </>
//     )
// }

// const Button = function ({setRandom}) {
//     return (
//         <button onClick={() => setRandom(Math.floor(Math.random()*1000))}>Randomize</button>
//     )
// }

// const ButtonWithState = withState(null, ['random'])(Button);

// const Display = function ({store}) {
//     return (
//         <span>{store.random}</span>
//     )
// }

// const DisplayWithState = withState(Display);

// const App = function () {
//     return (
//         <>
//             <DisplayWithState />
//             <ButtonWithState />
//         </>
//     )
// }

// const store = createStore();

// const AppWithState = connect(App, store);

// document.addEventListener('DOMContentLoaded', function () {
//     ReactDom.render(<AppWithState />, document.getElementById('root'));
// });

/***********************/

// const Button = function ({store}) {
//     console.log('asd')
//     return (
//         <button onClick={() => store.random = (Math.floor(Math.random()*1000))}>Randomize</button>
//     )
// }

// class Button extends React.Component {
//     render() {
//         console.log('asd')
//         return (
//             <button onClick={() => this.props.store.random = (Math.floor(Math.random()*1000))}>Randomize</button>
//         )
//     }
// }

// const ButtonWithState = withState(Button);

// const Display = function ({store}) {
//     return (
//         <span>{store.random}</span>
//     )
// }

// const DisplayWithState = withState(Display);

// const App = function () {
//     return (
//         <>
//             <DisplayWithState />
//             <ButtonWithState />
//         </>
//     )
// }

// const store = createStore();

// const AppWithState = connect(App, store);

// document.addEventListener('DOMContentLoaded', function () {
//     ReactDom.render(<AppWithState />, document.getElementById('root'));
// });

/*************** */

// const _createStore = function (...args) {
//     const store = createStore(...args);
//     const namedActions = {};
//     const unnamedActions = [];
//     store.dispatch = function (action, ...args) {
//         var _action;
//         if (typeof action === 'string') {
//             _action = namedActions[action];
//         } else {
//             _action = action;
//         }
//         const diff = _action(store, ...args);
//         Object.entries(diff).forEach(([key,value]) => store[key] = value);
//         return true;
//     }
//     store.createAction = function (...args) {
//         var action, name;
//         if (typeof args[0] === 'string') {
//             name = args[0];
//             action = args[1];
//             namedActions[name] = action;
//         } else {
//             action = args[0];
//             unnamedActions.push(action);
//         }
//         return function (...args) {
//             return store.dispatch(action, ...args);
//         }
//     }
//     return store;
// }

// const store = createStore({
//     counter: 0
// });
// console.log(store);
// const increment = (store => { store.counter = store.counter + 1 });

// // Option A
// const incrementA = (({counter}) => ({counter:counter+1})); // defining an action
// store.dispatch(incrementA); // dispatching an action

// // Option B
// const incrementB = store.createAction((({counter}) => ({counter:counter+1}))); // defining an action
// incrementB(); // dispatching an action

// // Option B2
// const incrementB2 = store.createAction('incrementB2', (({counter}) => ({counter:counter+1}))); // defining an action
// store.dispatch('incrementB2')

// const Button = withState()(() => (<button onClick={() => increment(store)}>Increment 0</button>));
// const ButtonA = withState()(({store}) => (<button onClick={() => store.dispatch(incrementA)}>Increment A</button>));
// const ButtonB = withState()(() => (<button onClick={() => incrementB()}>Increment B</button>));
// const ButtonC = withState()(({store}) => (<button onClick={() => store.dispatch('incrementB2')}>Increment C</button>));

// const ButtonD = withState([], [], [])(() => (<button onClick={() => increment(store)}>Increment D</button>));
// const ButtonE = withState([], [], [])(({store}) => (<button onClick={() => store.dispatch(incrementA)}>Increment E</button>));
// const ButtonF = withState([], [], [])(() => (<button onClick={() => incrementB()}>Increment F</button>));
// const ButtonG = withState([], [], [])(({store}) => (<button onClick={() => store.dispatch('incrementB2')}>Increment G</button>));
// const ButtonH = withState([], [], {incrementB})(({incrementB}) => (<button onClick={() => incrementB()}>Increment H</button>));
// const ButtonI = withState([], [], ['incrementB2'])(({incrementB2}) => (<button onClick={() => incrementB2()}>Increment I</button>));
// const ButtonJ = withState([], [], (dispatch) => ({incrementB:() => dispatch(({counter}) => ({counter:counter+1}))}))(({incrementB}) => (<button onClick={() => incrementB()}>Increment J</button>));

// const Display = function ({store}) {
//     return (
//         <span>{store.counter}</span>
//     )
// }

// const DisplayWithState = withState()(Display);

// const setTextA = (_,text) => ({text});
// const setTextB = store.createAction((_,text) => ({text}))
// const setTextB2 = store.createAction('setTextB2', (_,text) => ({text}))

// const TF0 = withState()(({store}) => (<input type="text" onChange={e => store.dispatch(setTextA, e.target.value)} />));
// const TF1 = withState()((() => (<input type="text" onChange={e => setTextB(e.target.value)}/>)));
// const TF2 = withState()(({store}) => (<input type="text" onChange={e => store.dispatch('setTextB2', e.target.value)} />));

// const TF3 = withState([],[],[])(({dispatch}) => (<input type="text" onChange={e => dispatch(setTextA, e.target.value)} />));
// const TF4 = withState([],[],[])(() => (<input type="text" onChange={e => setTextB(e.target.value)} />));
// const TF5 = withState([],[],{setTextA})(({setTextA}) => (<input type="text" onChange={e => setTextA(e.target.value)} />));
// const TF6 = withState([],[],{setTextB})(() => (<input type="text" onChange={e => setTextB(e.target.value)} />));
// const TF7 = withState([],[],(dispatch,ownProps) => ({setTextA:(text) => dispatch((_,text) => ({text}), text)}))(({setTextA}) => (<input type="text" onChange={e => setTextA(e.target.value)} />));
// const TF8 = withState([],[],['setTextB2'])((({setTextB2}) => (<input type="text" onChange={e => setTextB2(e.target.value)}/>)));
// const TF9 = withState([],[],[])(({dispatch}) => (<input type="text" onChange={e => dispatch('setTextB2', e.target.value)} />));

/*

withState(readProps: Array | Object, writeProps: Array | Object, actions: Array | Object | Function)
withState(prop0: String, prop1: String, ..., actions: Array | Object | Function)
withState(props: Object, actions: Array | Object | Function)
withState(mapStateToProps: Function, actions: Array | Object | Function)

withState()(({store}) => {
    store.dispatch(({foo}) => ({foo:++foo}));
})

withState(null,{ setFoo: () => ({foo:dispatch(({foo})=>({foo:++foo})}) })
withState(null,{ setFoo: () => ({foo})=>({foo:++foo})})

withState('foo')({foo,dispatch}) => {
    return (
        <button onClick={() => dispatch(({bar}) => ({bar:++bar}))}>{foo}</button>
    )
})

withState(prop0: String, prop1: String, ..., actions: String[] | Object | Function)
withState(props: String[] | Object | Function, actions: String[] | Object | Function)

*/

// const TextDisplay = withState()(({store}) => (<span>{store.text}</span>));

// const App = function () {
//     return (
//         <>
//             <div>
//                 <DisplayWithState />
//                 <Button />
//                 <ButtonA />
//                 <ButtonB />
//                 <ButtonC />
//                 <ButtonD />
//                 <ButtonE />
//                 <ButtonF />
//                 <ButtonG />
//                 <ButtonH />
//                 <ButtonI />
//                 <ButtonJ />
//             </div>
//             <div>
//                 <TF0 />
//                 <TF1 />
//                 <TF2 />
//                 <TF3 />
//                 <TF4 />
//                 <TF5 />
//                 <TF6 />
//                 <TF7 />
//                 <TF8 />
//                 <TF9 />
//                 <TextDisplay />
//             </div>
//         </>
//     )
// }

// const AppWithState = connect(App, store);

// document.addEventListener('DOMContentLoaded', function () {
//     ReactDom.render(<AppWithState />, document.getElementById('root'));
// });

/************+ */
const store = createStore({
    foo: {
        bar: 'baba'
    }
});
console.log(store);
const C = withState(({foo}) => ({foo}))(({foo}) => (<div>{foo.bar}</div>));

const App = connect(() => (<C />), store);

document.addEventListener('DOMContentLoaded', function () {
    ReactDom.render(<App />, document.getElementById('root'));
});

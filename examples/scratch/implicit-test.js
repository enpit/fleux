// var currentlyRenderingComponent = undefined;

// const withState = function (Component) {

//     if (typeof Component === 'function' && !React.Component.isPrototypeOf(Component)) {
//         return class StatefulComponent extends React.Component {
//             render() {
//                 currentlyRenderingComponent = this;
//                 const renderOutput = Component();
//                 currentlyRenderingComponent = undefined;
//                 return renderOutput;
//             }
//         }
//     } else {
//         return class StatefulComponent extends Component {
//             render() {
//                 currentlyRenderingComponent = this;
//                 const renderOutput = super.render();
//                 currentlyRenderingComponent = undefined;
//                 return renderOutput;
//             }
//         }
//     }

// }

// const _store = createStore({foo:'bar'});
// const handler = (function () {

//     const props = {};

//     return {
//         get: function (target, prop) {

//             if (typeof currentlyRenderingComponent === 'undefined') {
//                 return target[prop];
//             }

//             if (typeof props[prop] === 'undefined') {
//                 props[prop] = [currentlyRenderingComponent];
//             }

//             if (props[prop].indexOf(currentlyRenderingComponent) === -1) {
//                 props[prop].push(currentlyRenderingComponent);
//             }

//             return target[prop];
//         },
//         set: function (target, prop, value) {

//             target[prop] = value;

//             for (let component of props[prop]) {
//                 component.forceUpdate();
//             }

//             return true;
//         }
//     };
// }());
// const store = new Proxy(_store, handler)

// console.log(store);

// const Foo = function (props) {

//     const foo = store.foo;

//     return (
//         <div>{foo}</div>
//     )
// }

// const FooWithState = withState(Foo);

// const App = function () {
//     return (
//         <FooWithState />
//     )
// }

// const AppWithState = connect(App, store);

// document.addEventListener('DOMContentLoaded', function () {
//     ReactDom.render(<AppWithState />, document.getElementById('root'));
// });

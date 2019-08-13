import * as React from 'react';

import context from './context';
import { createStore, isStore } from './store';

export const connect = function (Component, value) {

    var store;

    if (typeof value === 'undefined') {
        throw new TypeError('Failed to connect component: Refusing to connect without a store. If you want to use an empty store, pass `{}` to `connect`.');
    }

    if (isStore(value)) {
        store = value;
    } else {
        store = createStore(value);
    }

    return class extends React.Component {
        render() {
            return (
                <context.Provider value={store}>
                    <Component {...this.props} />
                </context.Provider>
            )
        }
    }
}

export default connect;

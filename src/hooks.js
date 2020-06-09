import { useContext, useEffect, useState } from 'react';
import compare from 'just-compare';

import * as SYMBOLS from './symbols';
import context from './context';
import getNamedActions from './getNamedActions';
import preventWrites from './preventWrites';

export const useStore = function () {
    const store = useContext(context);
    var stateProps = {};
    const subscriptions = [];

    const callback = function (prop, value) {
        if (!compare(stateProps[prop], value)) {
            stateProps[prop] = value;
            localState[1]({[prop]: value});
        }
    };

    const localProxy = new Proxy(store, {
        get: function (target, prop) {
            subscriptions.push([prop, callback]);
            return target[SYMBOLS.STORE_GET](prop, callback);
        }
    });

    useEffect(() => () => {
        for (let subscription of subscriptions) {
            store[SYMBOLS.STORE_UNGET](subscription[0], subscription[1]);
        }
    });

    const localState = useState(localProxy);
    stateProps = { ...localState[0] };

    return localProxy;
}

export const useDispatch = function () {
    return useContext(context).dispatch;
}

export const useActions = function () {
    const store = useContext(context);
    return getNamedActions(store);
}

export const useSelector = function (selectStateProps) {
    const store = useContext(context);
    var stateProps = {};
    const subscriptions = [];

    const callback = function (prop, value) {
        localState[1]({...localProxy,[prop]:value});
    };

    const localProxy = new Proxy(store, {
        get: function (target, prop) {
            subscriptions.push([prop, callback]);
            return target[SYMBOLS.STORE_GET](prop, callback);
        }
    });

    useEffect(() => () => {
        for (let subscription of subscriptions) {
            store[SYMBOLS.STORE_UNGET](subscription[0], subscription[1]);
        }
    });

    const localState = useState(localProxy);

    const immutableStore = preventWrites(localState[0], 'Refusing to write to store inside of mapStateToProps.');
    stateProps = selectStateProps(immutableStore);

    return { ...stateProps, dispatch: store.dispatch };
}

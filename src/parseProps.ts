import typeOf from 'just-typeof';
import fromEntries from 'fromentries';

import * as SYMBOLS from './symbols';

export default function parseProps (args: any[]): Array<Array<Object> | Object> {

    var readablePropNames = [], writeablePropNames = [], actions = (store, ownProps) => {};

    if (args.every((propName) => typeof propName === 'string')) {
        readablePropNames = args;
        writeablePropNames = args;
    } else if (args.length === 1 && Array.isArray(args[0])) {
        readablePropNames = args[0];
    } else if (args.length === 2 && args.every(arg => Array.isArray(arg) || typeOf(arg) === 'null')) {
        readablePropNames = args[0] || [];
        writeablePropNames = args[1] || [];
    } else if (args.length === 3 && (Array.isArray(args[0]) || typeOf(args[0]) === 'null')) {
        readablePropNames = args[0] || [];
        writeablePropNames = args[1] || [];

        if (Array.isArray(args[2]) && args[2].every(action => typeof action === 'string')) {
            actions = store => fromEntries(args[2].map(actionName => [actionName, (...args) => store.dispatch(actionName, ...args)]));
        } else if (typeof args[2] === 'function') {
            actions = (store, ownProps) => args[2](store.dispatch, ownProps);
        } else if (typeof args[2] === 'object') {
            actions = (store) => fromEntries(Object.entries(args[2]).map(([_,action]) => {
                if (action[SYMBOLS.ACTION_MARKER]) {
                    return [_,action];
                } else {
                    return [_,(...args) => store.dispatch(action, ...args)];
                }
            }));
        }

    } else {
        throw Error(`Failed to parse arguments supplied to \`withState\`. Rejected invocation of \`withState\` with arguments of the types ${args.map(propName => typeOf(propName))}`);
    }

    return [readablePropNames, writeablePropNames, actions];

}

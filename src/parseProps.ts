import pascalCase from 'just-pascal-case';
import typeOf from 'just-typeof';
import fromEntries from 'fromentries';

import * as SYMBOLS from './symbols';

export default function parseProps (args: any[]): Array<Array<Object> | Object> {

    var selectStateProps = (store, ownProps) => ({}), bindActionProps = (store, ownProps) => {}, statePropNames: Array<[string, string]> = [];

    if (typeof args[0] === 'function') {
        selectStateProps = args[0];
    } else {

        if (args.every((propName) => typeof propName === 'string')) {
            statePropNames = args.map(name => [name,name]);
        } else if (Array.isArray(args[0]) && args[0].every((propName) => typeof propName === 'string')) {
            statePropNames = args[0].map(name => [name,name]);
        } else if (typeof args[0] === 'object') {
            statePropNames = Object.entries(args[0]);
        }

        selectStateProps = (store, ownProps) => {

            const conflictingNames = statePropNames.filter(([_,name]) => ownProps.hasOwnProperty(name)).concat(statePropNames.filter(([_,name]) => ownProps.hasOwnProperty('set' + pascalCase(name))));

            if (conflictingNames.length > 0) {
                throw Error(`Refusing to overwrite store props with parent-injected prop. The name(s) ${conflictingNames} exist in the store and are passed down from the parent component, resulting in a naming conflict.`);
            }

            // todo: add setters

            return fromEntries(statePropNames.map(([storeName, propName]) => [propName, store[storeName]]));

        }
    }

    if (Array.isArray(args[1]) && args[1].every(action => typeof action === 'string')) {
        bindActionProps = store => fromEntries(args[1].map(actionName => [actionName, (...args) => store.dispatch(actionName, ...args)]));
    } else if (typeof args[1] === 'function') {
        bindActionProps = (store, ownProps) => args[1](store.dispatch, ownProps);
    } else if (typeof args[1] === 'object') {
        bindActionProps = (store) => fromEntries(Object.entries(args[1]).map(([_,action]) => {
            if (action[SYMBOLS.ACTION_MARKER]) {
                return [_,action];
            } else {
                return [_,(...args) => store.dispatch(action, ...args)];
            }
        }));
    }

    // } else {
    //     throw Error(`Failed to parse arguments supplied to \`withState\`. Rejected invocation of \`withState\` with arguments of the types ${args.map(propName => typeOf(propName))}`);
    // }

    return [selectStateProps, bindActionProps];

}

import fromEntries from 'fromentries';
import pascalCase from 'just-pascal-case';

export const prepareWriteActions = function (...props) {
    return fromEntries(props.map(prop => (
        ['set'+pascalCase(prop), (store, setter, ...args) => ({...store, [prop]: setter(store[prop], ...args)})]
    )));
}

export default prepareWriteActions;

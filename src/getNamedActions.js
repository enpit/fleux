import * as SYMBOLS from './symbols';

export const getNamedActions = function (store) {
    return store[SYMBOLS.STORE_GETACTIONS]();
}

export default getNamedActions;

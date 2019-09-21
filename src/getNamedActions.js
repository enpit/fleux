import * as SYMBOLS from './symbols';

export const getNamedAction = function (store) {
    return store[SYMBOLS.STORE_GETACTIONS]();
}

export default getNamedAction;

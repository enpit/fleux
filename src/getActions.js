import * as SYMBOLS from './symbols';

export const getAction = function (store) {
    return store[SYMBOLS.STORE_GETACTIONS]();
}

export default getAction;

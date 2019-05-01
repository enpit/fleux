import { createStore } from './lib';

const store = createStore({
    counter: 0
});

export const { withStore } = store;
export default store;

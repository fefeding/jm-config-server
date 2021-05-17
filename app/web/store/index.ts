'use strict';
import Vue from 'vue';
import Vuex from 'vuex';
import RootState from './state';

import Menu from './menu';

Vue.use(Vuex);

export default function createStore(initState: any = {}) {
    const state = {
        ...initState,
        collapse: false, //菜单默认收缩
        menus: {}
     };
    return new Vuex.Store<RootState>({
        state,
        modules: {},
        mutations: {
            ...Menu
        }
    });
}

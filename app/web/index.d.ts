/// <reference path="./typings/global.d.ts" />
/// <reference path="./typings/vue-shims.d.ts" />

import { AxiosStatic } from 'axios';
import Vue from 'vue';
import '@jv/egg-jv-common';

declare const EASY_ENV_IS_NODE: boolean;
type PlainObject<T = any> = { [key: string]: T };

declare module 'vue/types/vue' {
    interface Vue {
        /**
         * 自定义的axios实例
         */
        $ajax: AxiosStatic;
    }
}

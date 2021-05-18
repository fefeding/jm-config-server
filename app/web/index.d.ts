/// <reference path="./typings/global.d.ts" />
/// <reference path="./typings/vue-shims.d.ts" />

import { AxiosStatic } from 'axios';

declare const EASY_ENV_IS_NODE: boolean;
type PlainObject<T = any> = { [key: string]: T };

declare module 'axios' {
    interface AxiosInstance {
        /**
         * 这里当项目有部署目录时，会指定。用来请求当前项目接口的根路径
         */
        baseURL: string

        /**
         * API请求通用方法
         * @param data 请求参数
         * @param options axios的请求参数，可以指定baseURL
         */
        requestApi<req, res>(
            data: req, options?: AxiosRequestConfig
        ): Promise<res>;
        
        /**
         * 从请求model里获取url，并组合baseURL
         * @param data 请求参数model
         * @param options axios的请求参数，可以指定baseURL
         */
        getApiUrl<req>(data: req, options?: AxiosRequestConfig): string;
    }
}

declare module 'vue/types/vue' {
    interface Vue {
        /**
         * 自定义的axios实例
         */
        $ajax: AxiosStatic;
    }
}

'use strict';

//import * as Reflect from 'global-reflect-metadata';
import 'reflect-metadata';
const apiRequestKey = 'models/api_request_options';

// 参数是否必需
export function api(options) {
    return Reflect.metadata(apiRequestKey, options);
}
// 获取api装饰对象
export function getApi(target) {
    let value = Reflect.getMetadata(apiRequestKey, target);
    if(typeof value == 'undefined' && target.constructor) {
        value = Reflect.getMetadata(apiRequestKey, target.constructor);
        
        if(typeof value === 'undefined') value = Reflect.getOwnMetadata(apiRequestKey, target);
    }
    return value;
}

export default {
    api,
    getApi
};


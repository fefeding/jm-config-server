'use strict';
/// <reference path="../index.d.ts" />

const axios = require('axios');
const cookies = require('js-cookie');
// 这里只能使用model里的装饰器，不然会导致跟其它组件的冲突
import decorator from './decorator';
import Request from '../model/interface/request';
const uuidv4 = require('uuid').v4;
// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

let config = {
    //   baseURL: process.env.BASE_URL || ""
    timeout: 35 * 1000 // Timeout
    // withCredentials: true, // Check cross-site Access-Control
};
const _axios = axios.create(config);

const httpReg = /^(http(s)?:)?\/\//i;

_axios.interceptors.request.use(
    function(config) {
        const csrf = _getToken();
        config.headers['x-csrf-token'] = csrf; // egg csrf
        try {
            // 避免兼容性问题
            config.headers['jm-traceid'] = uuidv4().split('-').join('');
        } catch (error) {}
        // Do something before request is sent
        return config;
    },
    function(error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

// Add a response interceptor
_axios.interceptors.response.use(
    function(response) {
        let { data, config } = response;
        // Do something with response data
        if (typeof data === 'string') {
            try {
                response.data = _parseJSON(data);
            } catch (e) {}
        }
        return response;
    },
    function(error) {
        let { config, response } = error;
        // Do something with response error
        return Promise.reject(error);
    }
);
/**
 * @description 计算token
 *  */
function _getToken() {
    if(typeof cookies != 'undefined') return cookies.get('csrfToken') || '';
    return "";
}
/**
 * @description 解析json
 *  */
function _parseJSON(data) {
    if (!data || typeof data !== 'string') {
        return data;
    }
    data = data === null ? '' : String.prototype.trim.call(data);
    try {
        data = JSON.parse(data);
    } catch (e) {
        data = new Function('return ' + data)();
    }
    return data;
}

/**
 * 获取API请求url
 */
_axios.getApiUrl = function(data, options) {
    options = options || {};
    var url = options.url || '';
    if(!url && data) {
        const targetOption = decorator.getApi(data);
        if(targetOption) {
            url = targetOption.url || '';
        }
    }
    // 如果是 /xxx/api/这种形式，则表示前面已加上了目录部署名，则不需要再次处理
    if(/^\/[^\/]+?\/api\//.test(url)) {
        // 如果这种情况，指定的baseUrl不是以 http  或 // 开头的，则表示为目录指定，去掉以免重复指定
        if(options.baseURL && !httpReg.test(options.baseURL)) {
            options.baseURL = '';
        }
    }
    // 如果不是绝对url，则拼上baseurl
    else if(options.baseURL && !httpReg.test(url)) {
        url = options.baseURL.replace(/\/$/, '') + '/' + url.replace(/^\//, '');
        options.baseURL = '';// 使用过后删除，以免axios重复用
    }

    // 有些url会用{baseURL}来标记当前部署目录
    const replaceBaseURL = (options.baseURL || '').replace(/\/$/g, '').replace(/^\//g, '');
    if(url) {
        url = url.replace('/{baseURL}/', replaceBaseURL?('/' + replaceBaseURL + '/'):'/');
    }
    return url;
}

/**
 * 通用请求api接口
 * @param data req数据
 * @param options axios请求参数，可以指定baseURL
 * @returns {ret: number, msg: string, data: any} 接口返回数据对象
 */
_axios.requestApi = async function(data, options) {
    // 这里暂时用data.data来判断，  但并不准确
    if(!options && !(data instanceof Request)) {
        options = data;
        data = data.data || {};
    }

    options = options||{};

    // 如果没有指定baseURL, 且有部署目录，就用部署目录做baseURL
    if((!options.url || !httpReg.test(options.url)) && !options.baseURL && this.baseURL) {
        options.baseURL = this.baseURL;
    }

    // 从装饰器里获取url
    let url = this.getApiUrl(data, options);
    options.url = url;
    options = Object.assign({
        method: 'post',
        data,
        url
    }, options||{});

    // egg 有时会配置数组表示request和resopnse返回时间
    if(options.timeout && Array.isArray(options.timeout)) {
        if(options.timeout.length >= 2) options.timeout = Number(options.timeout[0]) + Number(options.timeout[1]);
        else {
            options.timeout = Number(options.timeout[0]) || 5000;
        }
    }

    // axios的GET请求，需要用params来传参
    if(options.data && (options.method === 'get' || options.method === 'GET')) {
        options.params = Object.assign(options.data, options.params || {});
    }
    
    const res = await _axios.request(options);

    if(options.onComplete) {
        try {
            options.onComplete && options.onComplete(res);
        }
        catch(ex) {
            console.log(ex);
        }
    }

    if (res.status !== 200) {
        const errlog = `[axios requestApi] error: ${res.status} -- ${JSON.stringify(res.data)}`;
        // 当是写日志导致的报错时，不再重复去写日志，不然会死循环
        if(options.headers && options.headers['is-remote-log'] == '1') {
            console.log(errlog);
        }
        else {
            this.logger.error(errlog);
        }
    }

    return res.data;
};

export default _axios;

export {
    _axios as axios
}

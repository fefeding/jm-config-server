const devops = require('../devops.config.js');

import { EggAppConfig } from 'egg';
import * as path from 'path';

export default (appInfo: EggAppConfig) => {
    const config: any = {
        title: '配置系统',
        prefix: devops.prefix || '' // 部署目录名称
    };

    // 组合发布目录
    // 当nginx把目录带下来时，就需要加上目录名，否则不需要。这里暂时不清楚为什么有些nginx会带有些不会带
    //  devops.prefix? `/${devops.prefix}/docs/` :
    const publicPath = devops.prefix? `/${devops.prefix}/public/`:'/public/';
    const docsPath = devops.prefix? `/${devops.prefix}/docs/`:'/docs/';

    config.static = {
        maxAge: 0, // maxAge 缓存，默认 1 年
        prefix: publicPath,
        dir: [
            path.join(appInfo.baseDir, 'public'),
            {
                prefix: docsPath,
                dir: path.join(appInfo.baseDir, 'docs')
            }
        ]
    };

    config.vuessr = {
        layout: path.resolve(appInfo.baseDir, 'app/web/view/layout.html'),
        renderOptions: {
            basedir: path.join(appInfo.baseDir, 'app/view')
        }
    };

    // config.keys = 'jm-20210517';

    // session配置
    /*config.session = {
	  key: 'JM_SESSION',
	  maxAge: 24 * 3600 * 1000, // 1 天
	  httpOnly: true,
	  encrypt: true,
	}*/

    // 中间件access配置
    // 用来请求鉴权  只需要针对/api/ 这类的service请求
    // 计算方法 md5(accessKey + ',' + timestamp)
    config.apiAccess = {
        enabled: true, // false 表示不启用鉴权
        timeout: 300000, // timestamp超时设置，不配不检查超时
        accessKey: 'jm.20210517' // 用来计算token的当前系统唯一key
    };

    // 中间件
    config.middleware = [
        'access',
        'api' // api请求规范
    ];

    config.curl = {
        defaultDataType: 'json', // 默认的dataType
        timeout: [3000, 10000], // 连接和返回的超时时间
    };


    config.tars = {
        client: {
            // 主控地址
            locator: 'tars.tarsregistry.QueryObj@tcp -h 10.233.64.6 -t 60000 -p 17890',
            // 超时设置
            timeout: 60000
        }
    };

    // 配置上传
    config.multipart = {
        fileSize: '50mb',
        mode: 'stream',
        fileExtensions: ['.png', '.txt', '.jpg', '.gif', '.webp', '.pdf', '.m4a', '.wav'], // 扩展几种上传的文件格式
    };


    // 访问权限
    config.managers = {
        users: [
            92
        ]
    }

    // COS密钥和策略
    config.cos = {
        SecretId: '',
        SecretKey: '',
        Bucket: '',
        policy: {
            // 授予所有资源完全读写权限
            version: '2.0',
            statement: [
                {
                    action: ['*'],
                    effect: 'allow',
                    resource: ['*']
                }
            ]
        },
        dir: ''
    };

    return config;
};

/**
 * production
 *
 *  prod + default（override）
 */

import * as path from 'path';
import { Application, EggAppConfig } from 'egg';

export default (appInfo: EggAppConfig) => {
    const exports: any = {};
    /**
     * DB 测试库
     * https://typeorm.io/#/connection-options/mysql--mariadb-connection-options
     */
    const jvMysql = {
        name: 'default',
        type: 'mysql',
        "host": '127.0.0.1',
        "port": '3306',
        "username": 'root',
        password: '123456',
        database: 'db_jv_config',
        charset: 'utf8',
        useUTC: true,
        synchronize: false,
        logging: false,
        entities: [path.join(appInfo.baseDir, 'app/model/**/*.js')],
        extra: {
            connectionLimit: 5 // 连接池最大连接数量, 查阅资料 建议是  core number  * 2 + n
        }
    };

    const jvTestMysql = {
        name: 'testConfigDB',
        type: 'mysql',
        "host": '127.0.0.1',
        "port": '3306',
        "username": 'root',
        password: '123456',
        database: 'db_jv_config',
        charset: 'utf8',
        useUTC: true,
        synchronize: false,
        logging: false,
        entities: [path.join(appInfo.baseDir, 'app/model/**/*.js')],
        extra: {
            connectionLimit: 5 // 连接池最大连接数量, 查阅资料 建议是  core number  * 2 + n
        }
    };

    exports.mysql = {
        // database configuration
        clients: [
            jvMysql,            
        ],
        publishClients: [
            jvTestMysql,
        ]
    };

    // 参考：https://github.com/tencentyun/cos-nodejs-sdk-v5/blob/master/sdk/cos.js
    exports.cos = {
        /*"SecretId": '',
        "SecretKey": '',
        "Bucket": 'testpublic-1255000009', // Bucket 格式：test-1250000000
        "Domain": "testpublic-1255000009.cos.{{Region}}.jt-img.jm47.com", // 文件访问域名，带上桶
        "ServiceDomain": "cos.{{Region}}.jt-img.jm47.com", // 上传服务地址，不需要带桶
        "IsDomainSameToHost": true,
        //"Protocol": "https:",
        "Timeout": 60 * 1000, // 单位毫秒，0 代表不设置超时时间
        "Region": 'sz',
        "IsUseIntranet": true,
        "StrictSsl": false, // 内网证书问题。这里必须改为非严格模式
        "CompatibilityMode": true, // 我也不知道是什么意思，看sdk里如果这个是false，就会检查region，必须有-才不会报错
        */
        "ReplaceDomain": "",
        "prefix": 'config-server'
    };

    return exports;
};

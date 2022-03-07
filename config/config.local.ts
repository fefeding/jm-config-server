import { Application, EggAppConfig } from 'egg';
import * as path from 'path';

import * as EasyWebpack from 'easywebpack-vue';

export default (appInfo: EggAppConfig) => {
    const exports: any = {};

    exports.development = {
        watchDirs: ['build'], // 指定监视的目录（包括子目录），当目录下的文件变化的时候自动重载应用，路径从项目根目录开始写
        ignoreDirs: ['app/web', 'public', 'config'] // 指定过滤的目录（包括子目录）
    };

    exports.logview = {
        dir: path.join(appInfo.baseDir, 'logs')
    };

    exports.vuessr = {
        injectCss: false
    };

    /**
     * DB 测试库
     * https://typeorm.io/#/connection-options/mysql--mariadb-connection-options
     */
    const jvMysql = {
        name: 'default',
        type: 'mysql',
        host: '127.0.0.1',
        port: '3306',
        username: 'root',
        password: '123456',
        database: 'db_jv_config',
        charset: 'utf8',
        useUTC: true,
        synchronize: false,
        logging: false,
        entities: [path.join(appInfo.baseDir, 'app/model/**/*.ts')],
        extra: {
            connectionLimit: 5 // 连接池最大连接数量, 查阅资料 建议是  core number  * 2 + n
        }
    };

    exports.mysql = {
        // database configuration
        clients: [
            jvMysql
        ]
    };

    // 配置webpack开发端口
    exports.webpack = {
        port: 9100,
        proxy: {
          host: 'http://127.0.0.1:9100'
        },
        webpackConfigList: EasyWebpack.getWebpackConfig()
      };


    exports.cos = {
        SecretId: '',
        SecretKey: '',
        Bucket: '', // Bucket 格式：test-1250000000
        Region: 'ap-guangzhou',
        //"Domain": "{{Bucket}}.cos.{{Region}}.myqcloud.com", // 文件访问域名，带上桶
        "ServiceDomain": "cos.{{Region}}.myqcloud.com", // 上传服务地址，不需要带桶
        Protocol: '',
        CompatibilityMode: true,
        "Timeout": 60 * 1000, // 单位毫秒，0 代表不设置超时时间
        prefix: 'config-server'
    };

    return exports;
};





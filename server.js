// 给TAF调用的入口文件

const egg = require('egg');
const tarsConfig = require('./tarsConfig.js');

const options = {
    env: 'prod',
    port: process.env.PORT || 8082,
    host: process.env.IP || '127.0.0.1',
    workers: 1
};

async function start(options) {

    const app = await egg.start(options);

    try {

        // 加载mysql配置
        /*app.config.mysql = await tarsConfig.loadAndWatchConfig('Mysql.conf', {
            format: 'JSON',
            // 被动更新配置
            configPushed: (conf) => {
                console.log(conf);
                app.config.mysql = conf;
            }
        });

        // 加载cos配置
        app.config.cos = await tarsConfig.loadAndWatchConfig('PublicCos.conf', {
            format: 'JSON',
            // 被动更新配置
            configPushed: (conf) => {
                console.log(conf);
                app.config.cos = conf;
            }
        });

         // 加载基础服务配置
         const commonConf = await tarsConfig.loadAndWatchConfig('CommonWebServer', {
            format: 'JSON',
            // 被动更新配置
            configPushed: (conf) => {
                console.log(conf);
                // 合并tars配置
                app.config.common = Object.assign(app.config.common, conf);
            }
        });
        // 合并tars配置
        app.config.common = Object.assign(app.config.common, commonConf);

        // 加载tars主控配置
        app.config.tars.client = await tarsConfig.loadAndWatchConfig('TarsClient.conf', {
            format: 'JSON',
            // 被动更新配置
            configPushed: (conf) => {
                console.log(conf);
                app.config.tars.client = conf;
            }
        });

        // 加载基础服务配置
        app.config.jvCommon.jvAppId = await tarsConfig.loadAndWatchConfig('appId.conf', {
            format: 'TEXT',
            // 被动更新配置
            configPushed: (conf) => {
                console.log(conf);
                // 合并tars配置
                app.config.jvCommon.jvAppId = conf;
            }
        });

        // 加载RedisServant
        app.config.redisServant = await tarsConfig.loadAndWatchConfig('RedisServant.conf', {
            format: 'JSON',
            // 被动更新配置
            configPushed: (conf) => {
                console.log(conf);
                app.config.RedisServant = conf;
            }
        });

        // 加载用户中台配置
        app.config.userCenterServer = await tarsConfig.loadAndWatchConfig('UserCenterServer.conf', {
            format: 'JSON',
            // 被动更新配置
            configPushed: (conf) => {
                console.log(conf);
                app.config.userCenterServer = conf;
            }
        });

        // 加载用户中台配置
        app.config.icCenterServer = await tarsConfig.loadAndWatchConfig('ICCenterServer.conf', {
            format: 'JSON',
            // 被动更新配置
            configPushed: (conf) => {
                app.config.icCenterServer = conf;
            }
        });

        // 加载微信公众号配置
        app.config.jvWxConfig = await tarsConfig.loadAndWatchConfig('jvWxConfig.conf', {
            format: 'JSON',
            // 被动更新配置
            configPushed: (conf) => {
                console.log(conf);
                app.config.jvWxConfig = conf;
            }
        });

        // 微信token获取ip白名单
        app.config.wxTokenIPWhitelist = await tarsConfig.loadAndWatchConfig('wxTokenIPWhitelist.conf', {
            format: 'JSON',
            // 被动更新配置
            configPushed: (conf) => {
                console.log(conf);
                app.config.wxTokenIPWhitelist = conf;
            }
        });

        // 活动折扣操作权限
        app.config.actManager = await tarsConfig.loadAndWatchConfig('actManager.conf', {
            format: 'JSON',
            // 被动更新配置
            configPushed: (conf) => {
                console.log(conf);
                app.config.actManager = conf;
            }
        });

        // 加载管理员配置
        app.config.managers = await tarsConfig.loadAndWatchConfig('managers.conf', {
            format: 'JSON',
            // 被动更新配置
            configPushed: (conf) => {
                console.log(conf);
                // 合并tars配置
                app.config.managers = conf;
            }
        });*/
    }
    catch(e) {
        console.log(e);
    }

    app.listen(options.port, options.host);
    console.log(`server listen at ${options.host}:${options.port}`);
}

start(options);


//egg.startCluster(options);

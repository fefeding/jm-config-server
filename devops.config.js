/**
 * 发布部署相关配置
 */
module.exports = {
    /**
     * 部署目录
     * 例如： demo
     * 只有在正式环境才需要
     */
    prefix: process.env.NODE_ENV== 'development'? '' : ''
}


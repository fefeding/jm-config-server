import { IHelper } from 'egg';

import { JV as WxProxy } from '../tars/WxProxyServantProxy';

export default {
    /**
     * 请求demo服务接口
     * @param this helper对象
     * @param data 请求参数
     */
    requestDemoServer: async function<req, res>(this: IHelper, data: req): Promise<res> {
        // 要先计算请求token
        const apiToken = this.createApiToken(this.app.config.demo.accessKey);

        const res = await this.curl<req, res>({
            baseURL: this.app.config.demo.url,
            data,
            headers: {
                jvtoken: apiToken.sign,
                jvtimestamp: apiToken.timestamp,
            }
        });
        return res;
    },

    // 获取微信公众号的accesstoken
    async getWxAccessToken(this: IHelper, appid?: string) {
        const config = (this.ctx.app.config.jvWxConfig.servant) || {
            objName: 'JV.WxProxySvr.WxProxyServantObj'
        };

        const proxy = this.ctx.tarsClient.stringToProxy(
            WxProxy.WxProxyServantProxy,
            config.objName,
            config.setName || ''
        );

        console.log('getWxAccessToken', config);
        // 获取accesstoken
        const res = await proxy.getDeveloperAccessToken(appid || this.ctx.app.config.jvWxConfig.appId);
        console.log(res.response);
        return res.response.arguments.access_token;
    },
    // 获取微信公众号的Ticket
    async getJsApiTicket(this: IHelper, appid?: string) {
        const config = (this.ctx.app.config.jvWxConfig.servant) || {
            objName: 'JV.WxProxySvr.WxProxyServantObj'
        };

        const proxy = this.ctx.tarsClient.stringToProxy(
            WxProxy.WxProxyServantProxy,
            config.objName,
            config.setName || ''
        );

        console.log('getWxAccessToken', config);
        // 获取Ticket
        const res = await proxy.getJsApiTicket(appid || this.ctx.app.config.jvWxConfig.appId);
        console.log(res.response);

        return res.response.arguments.jsapi_ticket;
    }
};

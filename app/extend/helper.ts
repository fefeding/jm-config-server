import { IHelper } from 'egg';

export default {
    /**
     * 请求demo服务接口
     * @param this helper对象
     * @param data 请求参数
     */
    /*requestDemoServer: async function<req, res>(this: IHelper, data: req): Promise<res> {
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
    },*/
};

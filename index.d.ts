/// <reference path="./typings/index.d.ts" />
/// <reference path="./app/web/index.d.ts" />
import 'jm-egg-framework';

declare module 'egg' {
    interface Application {
        /**
         * 初始化DB状态， 0=无状态,1=初始化中，2=已完成
         */
        __initDBState: 0 | 1 | 2;
    }

    interface Context {

    }

    interface IHelper{
        /**
         * 请求demo服务接口
         * @param this helper对象
         * @param data 请求参数
         */
        requestDemoServer<req, res>(data: req): Promise<res>;
    }
}

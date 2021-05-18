import * as path from 'path';
import * as util from 'util';
import { Context } from 'egg';
export default () => {
    return async function access(ctx: Context, next: any) {
        // 这里写死登录态，如果要做登录请自行修改
        ctx.currentSession = {
            id: '123456',
            user: {
                staffId: '123456',
                name: 'admin'
            }
        };

        // 需要登录的请求才拦截
        if(ctx.checkNeedLogin() && !ctx.isManager()) {
            ctx.response.body = '非法访问，请联系管理员';
            return ;
        }

        await next();
    };
};

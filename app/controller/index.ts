import { Context, Controller } from 'egg';

export default class IndexController extends Controller {
    /**
     * 前端入口
     * @param ctx 上下文
     */
    public async home(ctx: Context): Promise<void> {
        await ctx.renderClient('home.js', {
            url: ctx.url || '/',
            title: this.app.config.title
            || '',
            // 部署目录名
            prefix: this.app.config.prefix,
            loginUser: this.ctx.currentSession?this.ctx.currentSession.user:{}
        });
    }
}

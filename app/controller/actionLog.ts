import { Context, Controller } from 'egg';
import { decorators } from 'jm-egg-framework';
import { ELogType } from '../model/actionLog';
import { Like } from 'typeorm';

export default class ActionLogController extends Controller {

    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async query(ctx: Context, params: {
        meta: {
            count: number,
            page: number
        },
        params: {
            type: ELogType,
            targetId: string
        }
    }): Promise<any> {
        const options = {
            where: {}
        };
        

        if(params.params.type > 0) {
            options.where['logType'] = params.params.type;
        }
        if(params.params.targetId) {
            options.where['targetId'] = params.params.targetId;
        }

        options['order'] = {
            modifyTime: "DESC"
        };

        const size =Math.max(params.meta.count, 1000);

        options['skip'] = params.meta.page * size;
        options['take'] = size;
        const [data, totalCount] = await ctx.service.actionLog.findAndCount(options);
        return {
            totalCount,
            data
        };
    }
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(false)
    public async queryList(ctx: Context, params: {
        count: number,
        page: number
        logType: ELogType,
        content: string;
        targetId: string
    }): Promise<any> {
        const options = {
            where: {}
        };
        
        if (params.logType > 0) {
            options.where['logType'] = params.logType;
        }

        if (params.targetId) {
            options.where['targetId'] = params.targetId;
        }

        if (params.content) {
            options.where['content'] = Like(`%${params.content}%`);
        }

        options['order'] = {
            modifyTime: "DESC"
        };

        const size = params.count;

        options['skip'] = (params.page - 1) * size;
        options['take'] = size;
        const [data, totalCount] = await ctx.service.actionLog.findAndCount(options);
        data.forEach(item=>{
            // 日志内容只展示前200个字符
            item.content = item.content.slice(0,200);
        })
        return {
            totalCount,
            data
        };
    }
}

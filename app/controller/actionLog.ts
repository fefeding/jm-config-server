import { Context, Controller } from 'egg';
import { decorators } from 'jm-egg-framework';
import { ELogType } from '../model/actionLog';

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
}

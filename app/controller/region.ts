import { Context, Controller } from 'egg';
import { decorators } from 'jm-egg-framework';
import {
    QuerySourceRegionsReq,
    QueryRegionTreeReq,
    QueryRegionTreeRsp,
    QuerySourceRegionRsp,
    SourceRegionSaveReq,
    SourceRegionSaveRsp,
    DeleteSourceRegionReq,
    DeleteSourceRegionRsp
} from '../model/interface/sourceRegion';

export default class SourceController extends Controller {
    /**
     * 获取所有目录, 如果指定了id就只返回单个
     * @param ctx 上下文
     * @param req 请求参数
     */
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(false)
    public async queryRegions(ctx: Context, req: QuerySourceRegionsReq): Promise<QuerySourceRegionRsp> {
        const rsp = new QuerySourceRegionRsp();

        rsp.ret = 0;
        rsp.msg = '';
        const data = await ctx.service.sourceRegion.queryRegion(req.id);

        rsp.data = data;

        return rsp;
    }

    /**
     * 查询目录结构
     * @param ctx 下下文
     * @param req 请求参数
     */
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(false)
    public async queryRegionTree(ctx: Context, req: QueryRegionTreeReq) : Promise<QueryRegionTreeRsp> {
        const rsp = new QueryRegionTreeRsp();

        const data = await ctx.service.sourceRegion.getRegionTree(req.containSource);

        rsp.data = data;

        return rsp;
    }

    /**
     * 保存目录,有ID则为修改，否则为新增
     * @param ctx 上下文
     * @param req 请求参数
     */
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async save(ctx: Context, req: SourceRegionSaveReq): Promise<SourceRegionSaveRsp> {
        const rsp = new SourceRegionSaveRsp();

        // 有id表示修改，否则为新增
        if(req.data && req.data.id > 0) {
            rsp.data = await ctx.service.sourceRegion.update(req.data);
        }
        else {
            rsp.data = await ctx.service.sourceRegion.add(req.data);
        }

        return rsp;
    }

    /**
     * 删除目录
     * @param ctx 下下文
     * @param req 请求参数
     */
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async delete(ctx: Context, req: DeleteSourceRegionReq) : Promise<DeleteSourceRegionRsp> {
        const rsp = new DeleteSourceRegionRsp();

        const ret = await ctx.service.sourceRegion.delete(req.id);
        if(ret) {
            rsp.ret = 0;
        }
        else {
            rsp.ret = 100004;
        }
        return rsp;
    }
}

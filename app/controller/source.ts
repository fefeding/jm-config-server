import { Context, Controller } from 'egg';
import { decorators } from 'jm-egg-framework';
import {
    GetAllSourceReq,
    GetAllSourceRsp,
    GetSourceByRegionReq,
    GetSourceByRegionRsp,
    GetSourceByIdReq,
    GetSourceByIdRsp,
    GetSourceByKeyReq,
    GetSourceByKeyRsp,
    SaveSourceReq,
    SaveSourceRsp,
    SaveSourceDataReq,
    SaveSourceDataRsp,
    DeleteSourceDataReq,
    DeleteSourceDataRsp,
    PublishSourceReq,
    PublishSourceRsp,
    DeleteSourceReq,
    DeleteSourceRsp,
    Source,
    SourceData,
    SearchPublishLogReq,
    SearchPublishLogRsp
} from '@jv/jv-models';

import SourceOrm from '../model/source';
import SourceDataOrm from '../model/sourceData';

export default class SourceController extends Controller {
    /**
     * 获取所有数据源
     * @param ctx 上下文
     * @param req 请求参数
     */
    @decorators.checkApiToken(false)
    public async getAll(ctx: Context, req: GetAllSourceReq): Promise<GetAllSourceRsp> {
        const rsp = new GetAllSourceRsp();

        const opt = {
            where: {}
        };
        if(typeof req.valid !== 'undefined') {
            opt.where['valid'] = req.valid;
        }
        const data = await ctx.service.source.find(opt);

        rsp.data = Source.fromArray<Source>(data, Source);

        return rsp;
    }

    /**
     * 获取某个止录下的所有数据源
     * @param ctx 上下文
     * @param req 请求参数
     */
    @decorators.checkApiToken(false)
    public async getByRegion(ctx: Context, req: GetSourceByRegionReq): Promise<GetSourceByRegionRsp> {
        const rsp = new GetSourceByRegionRsp();

        const data = await ctx.service.source.getByRegion(req.regionId);

        rsp.data = data;

        return rsp;
    }

    /**
     * 获取某个止录下的所有数据源
     * @param ctx 上下文
     * @param req 请求参数
     */
    @decorators.checkApiToken(false)
    public async getById(ctx: Context, req: GetSourceByIdReq): Promise<GetSourceByIdRsp> {
        const rsp = new GetSourceByIdRsp();

        const data = await ctx.service.source.get(req.id);

        rsp.data = new Source().fromJSON(data);

        // 单独接口同时返回它的所有数据
        const sdata = await ctx.service.sourceData.find({
            where: {
                valid: 1,
                sourceId: req.id
            }
        });
        if(sdata) {
            rsp.data.data = SourceData.fromArray<SourceData>(sdata, SourceData);
        }
        return rsp;
    }

    /**
     * 获取某个数据源，和其下的所有数据
     * @param ctx 上下文
     * @param req 请求参数
     */
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(false)
    public async getByKey(ctx: Context, req: GetSourceByKeyReq): Promise<GetSourceByKeyRsp> {
        const rsp = new GetSourceByKeyRsp();

        const data = await ctx.service.source.getSourceByKey(req.key);

        rsp.data = new Source().fromJSON(data);

        // 单独接口同时返回它的所有数据
        const sdata = await ctx.service.sourceData.find({
            where: {
                valid: 1,
                sourceId: data.id
            }
        });
        console.log(sdata);
        if(sdata) {
            rsp.data.data = SourceData.fromArray<SourceData>(sdata, SourceData);
        }
        return rsp;
    }

    /**
     * 保存
     * @param ctx 上下文
     * @param req 请求参数
     */
    @decorators.checkApiToken(false)
    public async save(ctx: Context, req: SaveSourceReq): Promise<SaveSourceRsp> {
        const rsp = new SaveSourceRsp();
        if(!req.data.description) {
            throw new Error('中文说明不能为空');
        }
        if(!req.data.regionId) {
            throw new Error('请指定目录');
        }
        if(!req.data.key) {
            throw new Error('key不可为空');
        }
        const conn = await ctx.service.source.getConnection();
        const qry = conn.createQueryRunner();
        try {
            await qry.startTransaction(); // 开始事务

            var orm  = new SourceOrm();
            // 新增
            if(!req.data.id || req.data.id == 0) {
                const srctmp = await ctx.service.source.getSourceByKey(req.data.key, conn);
                if(srctmp) {
                    console.log(srctmp);
                    throw new Error(`已经存在key为${req.data.key}的数据源`);
                }

                orm.creator = ctx.currentSession.user.staffId.toString();
                orm.regionId = req.data.regionId;
                orm.key = req.data.key;
            }
            else {
                // 修改的话，先把已存在的取出来，再修改其值
                orm = await ctx.service.source.get(req.data.id, conn);
            }

            orm.meta = req.data.meta;
            orm.description = req.data.description;
            orm.publishScript = req.data.publishScript || '';
            orm.updater = ctx.currentSession.user.staffId.toString();

            const data = await ctx.service.source.save(orm, conn);

            rsp.data = new Source().fromJSON(data);
        }
        catch(e) {
            rsp.ret = 1001;
            rsp.msg = e.message;
            console.log(e);
            await qry.rollbackTransaction();// 回滚
        }
        finally {

            // you need to release query runner which is manually created:
            await qry.release();
        }

        return rsp;
    }

    /**
     * 保存数据行数据
     * @param ctx 上下文
     * @param req 请求参数
     */
    @decorators.checkApiToken(false)
    public async saveData(ctx: Context, req: SaveSourceDataReq): Promise<SaveSourceDataRsp> {
        const rsp = new SaveSourceDataRsp();
        const conn = await ctx.service.sourceData.getConnection();

        var dataOrm = new SourceDataOrm();
        if(req.data.id > 0) {
            dataOrm = await ctx.service.sourceData.get(req.data.id, conn);
        }
        ctx.logger.info('query source id', req.data.sourceId, dataOrm);

        const qry = conn.createQueryRunner();
        ctx.logger.info(`save data`, req.data);
        try
        {
            ctx.logger.info('start transaction');
            await qry.startTransaction(); // 开始事务

            // 新增数据
            if(!dataOrm.id || dataOrm.id <= 0) {
                dataOrm.creator = ctx.currentSession.user.staffId.toString();

                const source = await ctx.service.source.findOne({
                    where: {
                        id: req.data.sourceId
                    }
                }, conn);

                if(!source) {
                    throw Error("不存在的数据源: " + req.data.sourceId);
                }
                ctx.logger.info('query source result', source);
                // 检查唯一健不能重复
                const primaryValues = {
                    
                }; // 获取唯一关健列
                var hasPrimaryField = false;
                var strWhere = "SourceData.Fvalid=1 and SourceData.Fsource_id=" + source.id;
                for(let f of source.meta.Fields) {
                    if(f.isUnique) {
                        primaryValues[f.name] = req.data.row[f.name];
                        hasPrimaryField = true;
                        strWhere += ` and SourceData.Frow->'\$.${f.name}'=:${f.name}`;
                    }
                }
                // 如果有唯一健，则查找是否存在重复的数据
                if(hasPrimaryField) {
                    ctx.logger.info(`has primary field`, strWhere, primaryValues);
                    const repos = await ctx.service.sourceData.getRespository(conn, SourceDataOrm);
                    const primaryDatas = await repos.createQueryBuilder("SourceData").where(strWhere, primaryValues).getMany();
                    ctx.logger.info('primary field data', primaryDatas);

                    if(primaryDatas && primaryDatas.length) {
                        throw Error(`关健值(${JSON.stringify(primaryValues)})已经存在，不可重复`);
                    }
                }
            }
            dataOrm.row = req.data.row;
            dataOrm.sourceId = req.data.sourceId;
            dataOrm.updater = ctx.currentSession.user.staffId.toString();
            ctx.logger.info('save data', dataOrm);
            const ret = await ctx.service.sourceData.save(dataOrm, conn);

            // 单独接口同时返回它的所有数据
            rsp.data = new SourceData().fromJSON(ret);
            if(ret.id <= 0) {
                rsp.ret = 100008;
                rsp.msg = '插入数据失败';
            }
            await qry.commitTransaction();// 提交事务
        }
        catch(e) {
            rsp.ret = 1001;
            rsp.msg = e.message;
            console.log(e);
            await qry.rollbackTransaction();// 回滚
        }
        finally {

            // you need to release query runner which is manually created:
            await qry.release();
        }
        return rsp;
    }

    /**
     * 删除行数据
     * @param ctx 上下文
     * @param req 请求参数
     */
    @decorators.checkApiToken(false)
    public async deleteData(ctx: Context, req: DeleteSourceDataReq): Promise<DeleteSourceDataRsp> {
        const rsp = new DeleteSourceDataRsp();

        if(req.id > 0) {
            const dataOrm = await ctx.service.sourceData.get(req.id);
            dataOrm.valid = 2;// 标记删除
            await ctx.service.sourceData.save(dataOrm);
        }
        else {
            rsp.ret = 100009;
            rsp.msg = '删除失败';
        }
        return rsp;
    }

    /**
     * 删除行数据
     * @param ctx 上下文
     * @param req 请求参数
     */
    @decorators.checkApiToken(false)
    public async publish(ctx: Context, req: PublishSourceReq): Promise<PublishSourceRsp> {
        const rsp = new PublishSourceRsp();

        if(req.id > 0) {
            const result = await ctx.service.publish.publish(req.id, "", req.dataId);
            return result;
        }
        else {
            rsp.ret = 100010;
            rsp.msg = '发布失败';
        }
        return rsp;
    }

    /**
     * 删除
     * @param ctx 上下文
     * @param req 请求参数
     */
    @decorators.checkApiToken(false)
    public async delete(ctx: Context, req: DeleteSourceReq): Promise<DeleteSourceRsp> {
        const rsp = new DeleteSourceRsp();

        if(req.id > 0) {
            await ctx.service.source.delete(req.id);
        }
        else {
            rsp.ret = 100010;
            rsp.msg = '删除失败';
        }
        return rsp;
    }

    /**
     * 查询发布日志
     * @param ctx 上下文
     * @param req 请求参数
     */
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(false)
    public async searchPublishLog(ctx: Context, req: SearchPublishLogReq): Promise<SearchPublishLogRsp> {
        return ctx.service.publish.searchLog(req);
    }

    // 上传
    @decorators.checkApiToken(false) // 标记需要校验token
    @decorators.checkApiLogin(true) // 登录态
    public async upload(ctx: Context) {
        return ctx.service.upload.upload();
    }
}

import { Context, Service } from 'egg';
import SourceData from '../model/sourceData';
import { SourceData as SaveSourceData, SaveSourceDataRsp } from '../model/interface/sourceData';
import { BaseTypeService } from './base';

export default class SourceDataService extends BaseTypeService<SourceData> {
    constructor(ctx: Context) {
        super(ctx, SourceData);
    }

    // 通过source id获取其所有数据
    async getDataById(id: number): Promise<SourceData[]> {
        const data = await this.find({
            where: {
                valid: 1,
                sourceId: id
            }
        });

        return data;
    }

    // 保存数据
    async saveData(data: SaveSourceData) {
        const rsp = new SaveSourceDataRsp();
        const ctx = this.ctx;
        const conn = await this.getConnection();
        var dataOrm = new SourceData();
        if(data.id > 0) {
            dataOrm = await this.get(data.id, conn);
        }
        ctx.logger.info('query source id', data.sourceId, dataOrm);

        const qry = conn.createQueryRunner();
        ctx.logger.info(`save data`, data);
        try
        {
            ctx.logger.info('start transaction');
            await qry.startTransaction(); // 开始事务

            // 新增数据
            if(!dataOrm.id || dataOrm.id <= 0) {
                dataOrm.creator = ctx.currentSession.user.staffId.toString();

                const source = await ctx.service.source.findOne({
                    where: {
                        id: data.sourceId
                    }
                }, conn);

                if(!source) {
                    throw Error("不存在的数据源: " + data.sourceId);
                }
                ctx.logger.info('query source result', source);
                // 检查唯一健不能重复
                const primaryValues = {

                }; // 获取唯一关健列
                var hasPrimaryField = false;
                var strWhere = "SourceData.Fvalid=1 and SourceData.Fsource_id=" + source.id;
                for(let f of source.meta.Fields) {
                    if(f.isUnique) {
                        primaryValues[f.name] = data.row[f.name];
                        hasPrimaryField = true;
                        strWhere += ` and SourceData.Frow->'\$.${f.name}'=:${f.name}`;
                    }
                }
                // 如果有唯一健，则查找是否存在重复的数据
                if(hasPrimaryField) {
                    ctx.logger.info(`has primary field`, strWhere, primaryValues);
                    const repos = await ctx.service.sourceData.getRespository(conn, SourceData);
                    const primaryDatas = await repos.createQueryBuilder("SourceData").where(strWhere, primaryValues).getMany();
                    ctx.logger.info('primary field data', primaryDatas);
                    if(primaryDatas && primaryDatas.length) {
                        throw Error(`关健值(${JSON.stringify(primaryValues)})已经存在，不可重复`);
                    }
                }
            }
            dataOrm.row = data.row;
            dataOrm.sourceId = data.sourceId;
            dataOrm.updater = ctx.currentSession.user.staffId.toString();
            ctx.logger.info('save data', dataOrm);
            const ret = await this.save(dataOrm, conn);

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
            // @ts-ignore
            rsp.msg = e.message as any;
            console.log(e);
            await qry.rollbackTransaction();// 回滚
        }
        finally {

            // you need to release query runner which is manually created:
            await qry.release();
        }
        return rsp;
    }
}

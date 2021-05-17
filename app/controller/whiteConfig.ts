import { Context, Controller } from 'egg';
import { decorators } from 'jm-egg-framework';
import * as moment from 'moment';
import { ELogType } from "../model/actionLog";

export default class WhiteConfigController extends Controller {

    async whiteConfigConnection(ctx: Context) {
        return await ctx.service.base.getConnection("whiteConfigDB");
    }

    async whiteDataConnection(ctx: Context) {
        return await ctx.service.base.getConnection("whiteDataDB");
    }

    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async queryConfig(ctx: Context, params: {
        meta: {
            count: number,
            page: number
        },
        params: {
            name: string,
            type: number,
            status: number,
            loginId: string
        }
    }): Promise<any> {
        let strWhere = '1=1';
        const qryParams = [];
        if(params.params.name) {
            strWhere += ` and Fname like ?`;
            qryParams.push(`%${params.params.name}%`);
        };
        // 如果有指定loginID 则去找包含这个loginid的所有包
        if(params.params.loginId) {
            const whiteData = await this.queryData(ctx, {
                meta: {
                    count: 0,
                    page: 1
                },
                params: {
                    loginId: params.params.loginId
                }
            });
            console.log(whiteData)
            if(whiteData.data && whiteData.data.length) {
                const ids = [];
                for(const d of whiteData.data) {
                    if(!ids.includes(d.Fwhite_list_id)) {
                        ids.push(d.Fwhite_list_id);
                    }
                }
                strWhere += ' and Fwhite_list_id in ('+ids.join(',')+')';
            }
        }

        const size = Math.min(params.meta.count, 1000) || 1000;

        const index = (params.meta.page-1) * size || 0;

        const conn = await this.whiteConfigConnection(ctx);
        try {
            const totalCount = await conn.query(`select count(0) as count from t_white_list_config where ${strWhere}`, qryParams);
            const sql = `select * from t_white_list_config where ${strWhere} order by Fmodify_time desc limit ${index}, ${size}`;
            console.log(sql, qryParams);
            const data = await conn.query(sql, qryParams);
            
            return {
                totalCount: totalCount[0].count,
                data
            };
        }
        catch(e) {
            throw e;
        }
        finally {
            await conn.close();
        }
    }

    // 修改包状态ctx.service.actionLog.insert(id, `查询白名单${data.name},${JSON.stringify(res.response.arguments.rsp)}`, ELogType.ZJWhite);
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async setStatus(ctx: Context, params: {
        id: number,
        status: number
    }): Promise<any> {
        if(params.id > 0) {
            let strWhere = 'Fwhite_list_id=?';
            const qryParams = [
                params.status, 
                ctx.currentSession.user.staffId.toString(),
                params.id
            ];
            

            const conn = await this.whiteConfigConnection(ctx);
            try {
                const data = await conn.query(`update t_white_list_config set Fstatus=?,Fupdater=? where ${strWhere}`, qryParams);
                ctx.service.actionLog.insert(params.id.toString(), `更改白名单状态: ${params.status}`, ELogType.JTWhite);
                return data;
            }
            catch(e) {
                throw e;
            }
            finally {
                await conn.close();
            }
        }
    }
    // 保存白名单包，如果没有ID则是新增
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async save(ctx: Context, params: {
        id: number,
        name: string,
        type: number,
        expireTime: string
    }): Promise<any> {       
            
            if(!params.name) {
                throw Error('包名不可为空');
            }
            const conn = await this.whiteConfigConnection(ctx);
            try {
                params.expireTime =  moment(params.expireTime).format('YYYY-MM-DD HH:mm:ss');
                if(params.id > 0) {
                    let strWhere = 'Fwhite_list_id=?';
                    const qryParams = [params.id];
                    const data = await conn.query(`update t_white_list_config set Fname=?,Ftype=?,Fexpire_time=?,Fupdater=? where ${strWhere}`, [
                        params.name,
                        params.type,
                        params.expireTime,
                        ctx.currentSession.user.staffId.toString(),
                        ...qryParams
                    ]);
                    ctx.service.actionLog.insert(params.id.toString(), `修改白名单包: ${JSON.stringify(params)}`, ELogType.JTWhite);
                    return data;
                }
                else {
                    const data = await conn.query(`insert into t_white_list_config(Fname,Ftype,Fexpire_time,Fcreator,Fupdater) values(?,?,?,?,?)`, [
                        params.name,
                        params.type,
                        params.expireTime,
                        ctx.currentSession.user.staffId.toString(),
                        ctx.currentSession.user.staffId.toString()
                    ]);
                    ctx.service.actionLog.insert('0', `新增白名单包: ${JSON.stringify(params)}`, ELogType.JTWhite);
                    return data;
                }
            }
            catch(e) {
                throw e;
            }
            finally {
                await conn.close();
            }
    }

    // 查找白名单
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async queryData(ctx: Context, params: {
        meta: {
            count: number,
            page: number
        },
        params: {
            loginId: string,
            whiteListId?: number
        }
    }): Promise<any> {
        let strWhere = '1=1';
        const qryParams = [];
        if(params.params.loginId) {
            strWhere += ` and Flogin_id = ?`;
            qryParams.push(params.params.loginId);
        };

        if(params.params.whiteListId) {
            strWhere += ` and Fwhite_list_id = ?`;
            qryParams.push(params.params.whiteListId);
        }

        const size = Math.min(params.meta.count, 1000) || 10000;

        const index = (params.meta.page-1) * size || 0;

        const conn = await this.whiteDataConnection(ctx);
        try {
            const totalCount = await conn.query(`select count(0) as count from t_white_list_data where ${strWhere}`, qryParams);
            const sql = `select * from t_white_list_data where ${strWhere} order by Fmodify_time desc limit ${index}, ${size}`;
            console.log(sql);
            const data = await conn.query(sql, qryParams);
            
            return {
                totalCount: totalCount[0].count,
                data
            };
        }
        catch(e) {
            throw e;
        }
        finally {
            await conn.close();
        }
    }

    // 设置白名单有效无效
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async setDataStatus(ctx: Context, params: {
        id: number,
        loginId: number,
        status: number
    }): Promise<any> {
        if(params.loginId > 0) {
            let strWhere = 'Fwhite_list_id=? and Flogin_id=?';
            const qryParams = [
                params.status, 
                params.id,
                params.loginId
            ];
            

            const conn = await this.whiteDataConnection(ctx);
            try {
                const data = await conn.query(`update t_white_list_data set Fvalid=? where ${strWhere}`, qryParams);
                ctx.service.actionLog.insert(params.loginId.toString(), `更改loginId白名单状态: ${params.status}`, ELogType.JTWhite);
                return data;
            }
            catch(e) {
                throw e;
            }
            finally {
                await conn.close();
            }
        }
    }

    
    // 批量增加loginid
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async addWhite(ctx: Context, params: {
        id: number,
        loginIds: string,
    }): Promise<any> {       
            
            if(!params.loginIds) {
                throw Error('loginid不可为空');
            }
            const conn = await this.whiteDataConnection(ctx);
            try {
                const ids = params.loginIds.split('\n');
                for(let loginId of ids) {
                    if(!loginId) continue;
                    loginId = loginId.trim();
                    if(!loginId || !/^\d+$/.test(loginId)) continue;
                    const idData = await conn.query(`select * from t_white_list_data where Fwhite_list_id=? and Flogin_id=?`, [
                        params.id,
                        loginId
                    ]);
                    // 如果已经存在，则修改为有效
                    if(idData && idData.length) {
                        if(idData[0].Fvalid != 1) {
                            await conn.query(`update t_white_list_data set Fvalid=1 where Fwhite_list_id=? and Flogin_id=?`, [
                                params.id,
                                loginId
                            ]);
                        }
                    }
                    else {
                        const data = await conn.query(`insert into t_white_list_data(Fwhite_list_id,Flogin_id,Fvalid) values(?,?,1)`, [
                            params.id,
                            loginId
                        ]);
                    }
                    ctx.service.actionLog.insert(params.id.toString(), `新增白名单: ${loginId}`, ELogType.JTWhite);
                }                   
                   
                return ids;
            }
            catch(e) {
                throw e;
            }
            finally {
                await conn.close();
            }
    }
}

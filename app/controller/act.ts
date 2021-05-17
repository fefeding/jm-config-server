import { Context, Controller } from 'egg';
import { decorators } from 'jm-egg-framework';
import * as moment from 'moment';
import { ELogType } from "../model/actionLog";
import { Connection } from 'typeorm';

export default class DiscountController extends Controller {

    async actConnection(ctx: Context) {
        return await ctx.service.base.getConnection("actDB");
    }

    async shardActConnection(ctx: Context) {
        return await ctx.service.base.getConnection("shardActDB");
    }

    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async queryDiscountProduct(ctx: Context, params: {
        meta: {
            count: number,
            page: number
        },
        params: {
            name: string,
            id: number
        }
    }): Promise<any> {
        let strWhere = '1=1';
        const qryParams = [];
        if(params.params.name) {
            strWhere += ` and Fproduct_brief_name like ?`;
            qryParams.push(`%${params.params.name}%`);
        };
        if(params.params.id) {
            strWhere += ` and Fproduct_id = ?`;
            qryParams.push(params.params.id);
        }

        const size = Math.min(params.meta.count, 1000) || 1000;

        const index = (params.meta.page-1) * size || 0;

        const conn = await this.actConnection(ctx);
        try {
            const totalCount = await conn.query(`select count(0) as count from t_act_discount_product_list where ${strWhere}`, qryParams);
            const sql = `select * from t_act_discount_product_list where ${strWhere} order by Fmodify_time desc limit ${index}, ${size}`;
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

    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async setDiscountProductStatus(ctx: Context, params: {
        id: number,
        status: number
    }): Promise<any> {

        if(!ctx.app.config.actManager || !ctx.app.config.actManager.includes(ctx.currentSession.user.staffId)) {
            throw Error('没有操作权限，请联系fefeding');
        }

        if(params.id > 0) {
            let strWhere = 'Fproduct_id=?';
            const qryParams = [
                params.status, 
                ctx.currentSession.user.staffId.toString(),
                params.id
            ];
            

            const conn = await this.actConnection(ctx);
            try {
                const data = await conn.query(`update t_act_discount_product_list set Fstatus=?,Fupdater=?,Fdeal_status=0 where ${strWhere}`, qryParams);
                ctx.service.actionLog.insert(params.id.toString(), `更改产品折扣状态: ${params.status}`, ELogType.ActDiscount);
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
    // 保存产品折扣信息
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async saveDiscountProduct(ctx: Context, params: {
        id: number,
        name: string,
        rate: number,
    }): Promise<any> {       
            
        if(!ctx.app.config.actManager || !ctx.app.config.actManager.includes(ctx.currentSession.user.staffId)) {
            throw Error('没有操作权限，请联系fefeding');
        }
        const conn = await this.actConnection(ctx);
        try {
            return await this.setDiscountProduct(ctx, {
                productId: params.id.toString(),
                name: params.name,
                rate: params.rate
            }, conn);
        }
        catch(e) {
            throw e;
        }
        finally {
            await conn.close();
        }
    }

    /**
     * 批量设置产品折扣信息
     * @param ctx 
     * @param params 
     * @returns 
     */
    @decorators.checkApiToken(true)
    @decorators.checkApiLogin(false)
    public async setDiscountProducts(ctx: Context, params: {products: Array<{
        productId: string,
        name: string,
        rate: number,
        update?: boolean
    }>}): Promise<any> {       
            

            const conn = await this.actConnection(ctx);
            const runner = conn.createQueryRunner();
            try {
                await runner.startTransaction();
                let res = 0
                for(const data of params.products) {
                    await this.setDiscountProduct(ctx, data, conn);
                    res ++;
                }
                await runner.commitTransaction();
                return res;
            }
            catch(e) {
                await runner.rollbackTransaction();
                throw e;
            }
            finally {
                await conn.close();
            }
    }

    /**
     * 设置单个折扣产品，如果存在就改其状态
     * @param ctx 
     * @param data 
     */
    public async setDiscountProduct(ctx: Context, data: {productId: string, name: string, rate: number, update?: boolean}, connection?: Connection) {
        

        if(data.rate < 0 || data.rate > 0) {
            throw Error(`哲扣${data.rate}异常`);
        }
        if(!data.productId) {
            throw Error('产品ID不可为空');
        }

        if(!connection) connection = await this.actConnection(ctx);

        // 查下是否存在
        const  strWhere = `Fproduct_id = ?`;
        const  qryParams = [data.productId];
        const existsData = await connection.query(`select * from t_act_discount_product_list where ${strWhere}`, qryParams);

        const staffId = ctx.currentSession && ctx.currentSession.user && ctx.currentSession.user.staffId? ctx.currentSession.user.staffId.toString() : 'system';
        if(existsData && existsData.length > 0) {
            if(data.update === false) return 0; // 如果指定了不需要更新，则不处理

            // 如果已经存在，且费率相同，且有效，且不是失败状态，则直接返回不用处理
            if(existsData[0].Fdiscount_rate == data.rate && existsData[0].Fstatus == 1 && existsData[0].Fdeal_status != 2) {
                return 1;
            }
            let strWhere = 'Fproduct_id=?';
            const res = await connection.query(`update t_act_discount_product_list set Fproduct_brief_name=?,Fdiscount_rate=?,Fdeal_status=0,Fupdater=? where ${strWhere}`, [
                data.name,
                data.rate,
                staffId,
                ...qryParams
            ]);
            ctx.service.actionLog.insert(data.productId, `修改折扣产品: ${JSON.stringify(data)}`, ELogType.ActDiscount);
            return res;
        }
        else {
            const res = await connection.query(`insert into t_act_discount_product_list(Fproduct_id,Fproduct_brief_name,Fdiscount_rate,Fcreater,Fupdater) values(?,?,?,?,?)`, [
                data.productId,
                data.name,
                data.rate,
                staffId,
                staffId
            ]);
            ctx.service.actionLog.insert(data.productId, `新增折扣产品: ${JSON.stringify(data)}`, ELogType.ActDiscount);
            return res;
        }
    }

    // 查找打折用户配置
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async queryDiscountUserData(ctx: Context, params: {
        meta: {
            count: number,
            page: number
        },
        params: {
            loginId: string,
        }
    }): Promise<any> {
        let strWhere = '1=1';
        const qryParams = [];
        if(params.params.loginId) {
            strWhere += ` and Flogin_id = ?`;
            qryParams.push(params.params.loginId);
        };


        const size = Math.min(params.meta.count, 1000) || 10000;

        const index = (params.meta.page-1) * size || 0;

        const conn = await this.actConnection(ctx);
        try {
            const totalCount = await conn.query(`select count(0) as count from t_discount_user_list where ${strWhere}`, qryParams);
            const sql = `select * from t_discount_user_list where ${strWhere} order by Fmodify_time desc limit ${index}, ${size}`;
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

    // 设置用户有效无效
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async setDiscountUserStatus(ctx: Context, params: {
        id: number,
        loginId: number,
        status: number
    }): Promise<any> {

        if(!ctx.app.config.actManager || !ctx.app.config.actManager.includes(ctx.currentSession.user.staffId)) {
            throw Error('没有操作权限，请联系fefeding');
        }

        
            let strWhere = '1=1';
            const qryParams = [
                params.status,
                ctx.currentSession.user.staffId.toString(),
            ];
            // 如果没有传入ID，则表示全量禁用
            if(params.loginId > 0) {
                strWhere += ' and Flogin_id=?';
                qryParams.push(params.loginId);
            }            

            const conn = await this.actConnection(ctx);
            try {
                const data = await conn.query(`update t_discount_user_list set Fstatus=?,Fdeal_status=0,Fupdater=? where ${strWhere}`, qryParams);
                ctx.service.actionLog.insert(params.loginId.toString(), `更改loginId名单状态: ${params.status}`, ELogType.ActDiscount);
                return data;
            }
            catch(e) {
                throw e;
            }
            finally {
                await conn.close();
            }
    }

    
    // 批量增加loginid
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async addDiscountUser(ctx: Context, params: {
        loginIds: string,
    }): Promise<any> {       
            if(!ctx.app.config.actManager || !ctx.app.config.actManager.includes(ctx.currentSession.user.staffId)) {
                throw Error('没有操作权限，请联系fefeding');
            }
            
            if(!params.loginIds) {
                throw Error('loginid不可为空');
            }
            const conn = await this.actConnection(ctx);
            const qry = conn.createQueryRunner('master');
            try {
                await qry.startTransaction();

                const ids = params.loginIds.split('\n');
                for(let loginId of ids) {
                    if(!loginId) continue;
                    loginId = loginId.trim();
                    if(!loginId || !/^\d+$/.test(loginId)) continue;
                    const idData = await qry.query(`select * from t_discount_user_list where Flogin_id=?`, [
                        loginId
                    ]);
                    // 如果已经存在，则修改为有效
                    if(idData && idData.length) {
                        if(idData[0].Fstatus != 1) {
                            await qry.query(`update t_discount_user_list set Fstatus=1,Fdeal_status=0,Fupdater=? where Flogin_id=?`, [,
                                ctx.currentSession.user.staffId.toString(),
                                loginId
                            ]);
                        }
                    }
                    else {
                        const data = await qry.query(`insert into t_discount_user_list(Flogin_id,Fcreater,Fupdater) values(?,?,?)`, [
                            loginId,
                            ctx.currentSession.user.staffId.toString(),
                            ctx.currentSession.user.staffId.toString()
                        ]);
                    }
                    ctx.service.actionLog.insert(loginId.toString(), `新增白名单: ${loginId}`, ELogType.ActDiscount);
                }                   
                
                await qry.commitTransaction();

                return ids;
            }
            catch(e) {
                await qry.rollbackTransaction();
                throw e;
            }
            finally {
                await qry.release();
            }
    }

    // 查询打折用户结果信息
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async queryDiscountUserDataLog(ctx: Context, params: {
        meta: {
            count: number,
            page: number
        },
        params: {
            loginId: string,
            productId: string
        }
    }): Promise<any> {
        let strWhere = '1=1';
        const qryParams = [];
        if(params.params.loginId) {
            strWhere += ` and Flogin_id = ?`;
            qryParams.push(params.params.loginId);
        };

        if(params.params.productId) {
            strWhere += ` and Fproduct_id = ?`;
            qryParams.push(params.params.productId);
        };

        const size = Math.min(params.meta.count, 1000) || 10000;

        const index = (params.meta.page-1) * size || 0;

        const conn = await this.shardActConnection(ctx);
        try {
            const totalCount = await conn.query(`select count(0) as count from t_group_discount_log where ${strWhere}`, qryParams);
            const sql = `select * from t_group_discount_log where ${strWhere} order by Fmodify_time desc limit ${index}, ${size}`;
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
}

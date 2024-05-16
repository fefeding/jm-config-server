import * as vm from 'vm';
import * as moment from 'moment';
import { Context } from 'egg';
import { ProxyResponse } from '@tars/rpc';
import PublishLogOrm from '../model/publishLog';
import { Source, PublishSourceRsp } from '../model/interface/sourceData';
import { PublishLog, PublishLogState, SearchPublishLogReq, SearchPublishLogRsp} from '../model/interface/publishLog';
import { BaseTypeService } from './base';
import { ary } from 'lodash';

export default class SourceService extends BaseTypeService<PublishLogOrm> {
    constructor(ctx: Context) {
        super(ctx, PublishLogOrm);
    }

    // 执行发布脚本，
    // 如果指定了dataId，则表示是发这单行数据
    async publish(id: number, scriptContent?: string, dataId?: number): Promise<PublishSourceRsp> {
        const sourceOrm = await this.ctx.service.source.get(id); //获取配置

        if(!sourceOrm.publishScript) {
            throw new Error('没有配置发布脚本');
        }

        const source = new Source().fromJSON(sourceOrm);
        // 获取当前操作的所有数据
        // 如果是发布单条数据。则查出这条记录
        if(dataId > 0) {
            source.data = await this.ctx.service.sourceData.find({
                where: {
                    valid: 1,
                    sourceId: source.id,
                    id: dataId
                }
            });
        }
        else {
            source.data = await this.ctx.service.sourceData.find({
                where: {
                    valid: 1,
                    sourceId: source.id
                }
            });
        }
        scriptContent = scriptContent || sourceOrm.publishScript;

        const rsp = new PublishSourceRsp();

        const log = new PublishLogOrm();
        log.sourceId = id;
        log.updater = log.creator = this.ctx.currentSession.user.staffId.toString();

        // 单条发布
        if(dataId > 0) {
            log.content = `${moment().format('HH:mm:ss')}\n start publish one row dataId:${dataId} ${source.key} ${source.description} \n`;
        }
        else {
            log.content = `${moment().format('HH:mm:ss')}\n start publish ${source.key} ${source.description} \n`;
        }

        try {
            // 发布脚本中的console托管。记录日志
            const vconsole = {
                info: (...args) => {
                    console.info(...args);
                    log.content += `[info] ${args.map((v)=>typeof v ==='object'? JSON.stringify(v):v).join('\n')}\n`;
                },
                log: (...args) => {
                    console.log(...args);
                    log.content += `[info] ${args.map((v)=>typeof v ==='object'? JSON.stringify(v):v).join('\n')}\n`;
                },
                error: (...args) => {
                    console.error(...args);
                    log.content += `[error] ${args.map((v)=>typeof v ==='object'? JSON.stringify(v):v).join('\n')}\n`;
                },
                debug: (...args) => {
                    console.debug(...args);
                    log.content += `[debug] ${args.map((v)=>typeof v ==='object'? JSON.stringify(v):v).join('\n')}\n`;
                }
            };

            const options = {
                params: {
                    '$syncDataToTable': async (table: string, data: any, db?: string, start?: Function) => {
                        vconsole.info('$syncDataToTable', table, data, db);
                        // 同步到表
                        return await this.syncDataToTable(table, data, db, dataId, start);
                    },
                    '$syncDataToRedis': async (key: string, data, forced=false) => {
                        // 发布单条记录，不能直接发布redis，会导致覆盖全量
                        if(dataId > 0 && !forced) {
                            vconsole.info('$syncDataToRedis', dataId, '单条发布不同步redis return');
                            return;
                        }
                        key = 'jv_config_' + key;
                        vconsole.info('$syncDataToRedis', key, data);
                        // 同步到redis
                        const res = await this.syncDataToRedis(key, data);
                        vconsole.info(res);
                        return res;
                    },
                    '$publishToCos': async (data, filenmae?:string, contentType?: string, dir = '') => {
                        let res = {};
                        if(typeof data === 'object') data = JSON.stringify(data);
                        res = await this.ctx.service.upload.uploadString(data, filenmae, contentType||"application/json", dir);
                        vconsole.info('$publishToCos', res);
                        return res;
                    },
                    '$getSourceByKey': async (key: string) => {
                        vconsole.info('$getSourceByKey', key);
                        // 通过key获取其它数据源
                        const data = await this.ctx.service.source.getSourceByKey(key);

                        vconsole.info(data);
                        return data;
                    },
                    "console": vconsole,
                    '$currentSource': source,
                    "$dataId": dataId || 0,// 如果是单条，则会有这个id
                    // 注入当前用户信息
                    '$currentUser': this.ctx.currentSession.user || {},
                    moment
                }
            }

            const res = await this.runScript(scriptContent, options);

            log.content += '\n' + (typeof res !== 'string'? JSON.stringify(res): res) + '\n';
            log.state = PublishLogState.success;
        }
        catch(e) {
            console.log(e);

            rsp.ret = 10000012;
            // @ts-ignore
            rsp.msg = '发布失败:' + (e.message as any);
            log.content += `${e.toString()}\n`;
            log.state = PublishLogState.failed;
        }

        log.content += moment().format('HH:mm:ss');
        this.save(log); // 保存日志

        rsp.data = log.content;
        return rsp;
    }

    // 运行一个函数脚本，动态提供参数
    async runScript(code, options) {
        options = options || {};
        const paramNames = [];// 函数参数名，
        const paramValues = []; // 函数调用参数值
        if(options.params) {
            for(let k in options.params) {
                if(typeof k !== 'string') continue;
                paramNames.push(k);
                paramValues.push(options.params[k]);
            }
        }

        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const fun = new AsyncFunction(...paramNames, code);
        //const fun = (new Function('AsyncFunction', 'code', `return new AsyncFunction("${paramNames.join('","')}", code)`))(AsyncFunction, code);

        const res = await fun.call(this, ...paramValues);
        return res;
    }

    // 把数据同步到对应的表中
    // tableName 发布到目标表名
    // data 发布的数据，为一个数组， 数组内的每个属性名为对应的字段
    // db 可选，  指定要发布到config中配的哪个库，默认是 default
    // dataid 如果指定了，则表示只发布一条记录
    async syncDataToTable(tableName: string, data: any, db?: string, dataId?: number, start?: Function) {
        if(!tableName ||
            ((!db || db =='default') && !tableName.startsWith('t_result_'))
        ) {
            throw new Error('请输入正确的表名，如果是config库，表名必须以 t_result_ 开头');
        }
        tableName = tableName.replace(/['"=\s]/, '');// 不能有一些特殊字符
        const qry = (await this.getConnection(db)).createQueryRunner();
        try
        {
            console.log(`开始同步数据到表 ${tableName}`);
            // 开启事务
            await qry.startTransaction();

            // 没有指定单条，才需要删除所有，不然只发布一条即可
            if(!dataId || dataId == 0) {
                // 先清空结果表数据
                // 没有配置单条清除的，才需要全清，否则用start来清一条加一条。
                if(start) {
                    await start(qry, tableName);
                }
                // 如果没有指定初始化函数，则全清空目标表
                else {
                    await qry.query(`delete from ${tableName}`);
                }
            }

            if(!Array.isArray(data)) {
                data = [data];
            }
            const insertSql = `insert into ${tableName}`;

            for(let d of data) {

                const fields = [];
                const values = [];
                const params = [];
                for(let k in d) {
                    let v = d[k];
                    if(typeof v === 'undefined') {
                        console.log('字段', k , v, 'continue');
                        continue;
                    }
                    if(typeof v === 'object') v = JSON.stringify(v);
                    fields.push(`\`${k}\``);
                    values.push(v);
                    params.push('?');
                }
                const sql = `${insertSql}(${fields.join(',')}) values(${params.join(',')})`;
                console.log(sql, values);

                // 执行初始化操作，提供事务，一般在单条操作时，给脚本一种清除单条记录的能力
                if(start) {
                    await start(qry, tableName, d);
                }

                await qry.query(sql, values);
            }
            await qry.commitTransaction();// 提交事务
            console.log(`结束同步数据到表 ${tableName}`);
        }
        catch(e) {
            console.log(e);
            await qry.rollbackTransaction();
            console.log(`回滚同步数据到表 ${tableName}`);
            throw e;
        }
        finally {
            if(!qry.isReleased) await qry.release();
        }
    }

    // 同步数据到指定的redis下面
    async syncDataToRedis(key: string, data): Promise<ProxyResponse<number, undefined>> {
        //console.log(`发布数据到redis`, key, data);
        const res = await this.ctx.writeRedisConfig(key, data);
        return res;
    }

    // 查询日志
    async searchLog(req: SearchPublishLogReq): Promise<SearchPublishLogRsp> {
        const rsp = new SearchPublishLogRsp();

        const options = {
            where: {}
        };

        options['select'] = [
            "id", "sourceId", "state", "content", "updater", "modifyTime", "creator", "createTime"
        ];

        if(req.state > 0) {
            options.where['state'] = req.state;
        }
        if(req.sourceId > 0) {
            options.where['sourceId'] = req.sourceId;
        }
        //if(req.id > 0) {
        //    options['select'].push('content');
        //    options.where['id'] = req.id;
        //}

        options['order'] = {
            modifyTime: "DESC"
        };

        const page = (req.page < 1? 1: req.page) - 1; // 传入是从1 起的，我们转为从0起
        const size = req.size < 1 ? 20:
                    (req.size > 100 ? 100: req.size); // size 不能超过100，必须大于1

        options['skip'] = page * size;
        options['take'] = size;

        const [data, totalCount] = await this.findAndCount(options);

        rsp.total = totalCount;
        rsp.data = PublishLog.fromArray<PublishLog>(data, PublishLog);
        return rsp;
    }
}

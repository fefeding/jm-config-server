import { Context, Service } from 'egg';
import { default as ActionLog, ELogType } from '../model/actionLog';
import { BaseTypeService } from './base';

export default class ActionLogService extends BaseTypeService<ActionLog> {
    constructor(ctx: Context) {
        super(ctx, ActionLog);
    }

    // 通过targetid获取其所有数据
    async getById(id: string): Promise<ActionLog[]> {
        const data = await this.find({
            where: {
                valid: 1,
                targetId: id
            }
        });

        return data;
    }

    // 新增日志
    async insert(id:string, content: string, logType: ELogType) {
        if(!this.ctx.currentSession || !this.ctx.currentSession.user || !this.ctx.currentSession.user.staffId) return;
        const log = new ActionLog();
        log.updater = log.creator = this.ctx.currentSession.user.staffId.toString();
        log.content = content;
        log.logType = logType;
        log.targetId = id;

        return this.save(log)
    }
}

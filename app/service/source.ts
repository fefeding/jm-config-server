import * as vm from 'vm';
//import * as uglifyjs from 'uglify-js';
import { Context, Service } from 'egg';
import { EValid } from '@jv/jv-models/base/enumType';
import SourceOrm from '../model/source'; //'../../../../../common/egg-jv-config/model/sourceData';
import { Source, PublishSourceRsp, Response } from '@jv/jv-models';
import { BaseTypeService } from './base';
import { Connection } from 'typeorm';

export default class SourceService extends BaseTypeService<SourceOrm> {
    constructor(ctx: Context) {
        super(ctx, SourceOrm);
    }

    /**
     * 获取指定目录下的数据源
     * @param regionId 目录ID
     */
    async getByRegion(regionId: number) : Promise<Source[]> {
        const data = await this.find({
            where: {
                regionId: regionId,
                valid: 1
            },
            cache: true
        });
        return Source.fromArray<Source>(data, Source);
    }

    /**
     * 通过key获取配置
     * 并返回其数据
     */
    async getSourceByKey(key: string, db?: Connection|string) : Promise<Source> {
        const data = await this.get({
            where: {
                key: key
            }
        }, db);
        if(data) {
            const source = new Source().fromJSON(data);
            source.data = await this.ctx.service.sourceData.getDataById(source.id);
            return source;
        }
    }

    /**
     * 删除数据源
     * @param id 要删除的ID
     */
    async delete(id: number): Promise<boolean> {
        var orm = await this.get(id);
        if(!orm) {
            throw new Error('不存在的数据源');
        }

        orm.valid = EValid.Unvalid; // 标记删除
        orm = await this.save(orm);
        return orm.valid === EValid.Unvalid;
    }

}

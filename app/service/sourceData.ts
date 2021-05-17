import { Context, Service } from 'egg';
import SourceData from '../model/sourceData';
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
}

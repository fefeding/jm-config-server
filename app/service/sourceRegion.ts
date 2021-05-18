import { Context, Service } from 'egg';
import SourceRegionORM from '../model/sourceRegion';
import { SourceRegion } from '../model/interface/sourceRegion';
import { EValid } from '../model/interface/enumType';
import { BaseTypeService } from './base';

export default class SourceRegionService extends BaseTypeService<SourceRegionORM> {
    constructor(ctx: Context) {
        super(ctx, SourceRegionORM);
    }
    /**
     * 查询目录
     * @param id 目录id，如果没传则返回全部
     */
    async queryRegion(id?: number): Promise<SourceRegion[]> {
        const options = {
            where: {
                valid: EValid.Valid
            },
            cache: true
        };
        if(id > 0) {
            options.where['id'] = id;
        }
        const data = await this.find(options);
        return SourceRegion.fromArray<SourceRegion>(data, SourceRegion);
    }

    /**
     * 获取树结构目录
     * containSource 是否获取目录下的数据源
     */
    async getRegionTree(containSource?: boolean): Promise<SourceRegion> {
        const root = new SourceRegion({
            parentId : 0,
            id: 0,
            name: '根目录'
        });
        const regions = await this.queryRegion();// 所有目录

        root.children = await this.getChildren(root, regions, containSource);// 递归子目录
        return root;
    }

    /**
     * 获取子节点集合
     * @param parentId 父ID
     */
    async getChildren(parent: SourceRegion, regions: SourceRegion[], containSource?: boolean): Promise<SourceRegion[]> {
        const children = new Array<SourceRegion>();
        for(let r of regions) {
            if(r.parentId === parent.id) {
                r.children = await this.getChildren(r, regions, containSource);// 递归获取所有子目录
                children.push(r);
            }
        }
        // 获取目录下的数据源
        if(containSource && parent.id > 0) {
            parent.Sources = await this.ctx.service.source.getByRegion(parent.id);
            for(let s of parent.Sources) {
                delete s.publishScript;
                delete s.meta;
            }
        }
        return children;
    }

    /**
     * 获取子目录
     * @param id 父ID
     */
    async getChildrenRegions(id: number): Promise<SourceRegion[]> {
        const options = {
            where: {
                valid: EValid.Valid,
                parentId: id
            }
        };
        const data = await this.find(options);
        return SourceRegion.fromArray<SourceRegion>(data, SourceRegion);
    }

    /**
     * 新增目录
     * @param region 目录
     */
    async add(region: SourceRegion): Promise<SourceRegion> {
        if(!region.name) {
            throw new Error('目录名不可为空');
        }
        const regionOrm = new SourceRegionORM();
        regionOrm.name = region.name;
        regionOrm.parentId = region.parentId || 0;
        regionOrm.updater = this.ctx.currentSession.user.staffId.toString();
        regionOrm.creator = this.ctx.currentSession.user.staffId.toString();

        if(regionOrm.parentId > 0) {
            const sources = await this.ctx.service.source.getByRegion(regionOrm.parentId);
            if(sources && sources.length) {
                throw new Error('当前目录下已存在数据源，无法创建子目录');
            }
        }
        const ret = await this.save(regionOrm);
        region.id = ret.id;
        region.parentId = ret.parentId;

        return region;
    }

    /**
     * 主要是修改目录名字
     * @param region 目录信息
     */
    async update(region: SourceRegion): Promise<SourceRegion> {
        if(!region.name) {
            throw new Error('目录名不可为空');
        }
        else if(!region.id) {
            throw new Error('目录id不可为空');
        }
        const orm = await this.get(region.id);
        orm.name = region.name;
        orm.updater = this.ctx.currentSession.user.staffId.toString();

        const ret = await this.save(orm);
        return region;
    }

    /**
     * 删除目录
     * @param id 要删除的ID
     */
    async delete(id: number): Promise<boolean> {
        var orm = await this.get(id);
        if(!orm) {
            throw new Error('不存在的目录');
        }

        const sources = await this.service.source.getByRegion(id);
        if(sources && sources.length) {
            throw new Error('目录下存在数据源，不允许删除');
        }

        const childSources = await this.getChildrenRegions(id); //获取子目录
        if(childSources && childSources.length) {
            throw new Error('目录下存在子目录，不允许删除');
        }

        orm.valid = EValid.Unvalid; // 标记删除
        orm = await this.save(orm);
        return orm.valid === EValid.Unvalid;
    }
}

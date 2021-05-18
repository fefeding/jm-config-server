
import decorators from '../../lib/decorator';
import BaseModel from './model';
import { Source } from './sourceData';
import req from "./request";
import rsp from "./response";

/**
 * 数据源域目录
 */
export class SourceRegion extends BaseModel {
    public id: number;

    /**
     * 父目录ID
     */
    public parentId: number;

    /**
     * 目录名
     */
    public name: string;

    /**
     * 所有子目录
     */
    public children: Array<SourceRegion>;

    /**
     * 当前目录下所有数据源
     */
    public Sources?: Array<Source>;
}

/**
 * 查询目录接口
 * id=0时获取所有的
 */
@decorators.api({
    url: '/api/region/queryRegions'
})
export class QuerySourceRegionsReq extends req {
    /**
     * 需要获取目录的id，如果为0则获取所有的
     */
    public id?: number;
}

/**
 * 目录返回
 */
export class QuerySourceRegionRsp extends rsp {
    data: Array<SourceRegion>
}

/**
 * 获取目录树结构，根结点为root
 * id=0时获取所有的
 */
@decorators.api({
    url: '/api/region/queryRegionTree'
})
export class QueryRegionTreeReq extends req {  
    /**
     * true表示把目录下的source一并返回
     */
    public containSource?: boolean;  
}

/**
 * 目录返回
 */
export class QueryRegionTreeRsp extends rsp {
    data: SourceRegion
}

/**
 * 保存目录
 */

@decorators.api({
    url: '/api/region/save'
})
export class SourceRegionSaveReq extends req {    
    data: SourceRegion
}

/**
 * 目录返回
 */
export class SourceRegionSaveRsp extends rsp {
    data: SourceRegion
}

 /** end 保存目录 */

 /**
 * 删除
 */
@decorators.api({
    url: '/api/region/delete'
})
export class DeleteSourceRegionReq extends req {
    /**
     * 需要获取目录的id，如果为0则获取所有的
     */
    public id: number;
}

/**
 * 删除
 */
export class DeleteSourceRegionRsp extends rsp {
    data?: SourceRegion
}
'use strict';
import { EValid } from './enumType';
import BaseModel from './model';
import req from "./request";
import rsp from "./response";
import decorators from '../../lib/decorator';
import { PlainObject, IFilterFun } from './cos';

export default class Source extends BaseModel {

    public id: number = 0;

    /**
     * 所属域，目录管理
     **/
    public regionId: number = 0;

    /**
     * 数据源关健值
     * 用户输入，用于做变量名
     */
    public key: string = "";

    /**
     * 发布脚本
     */
    public publishScript: string = '';
    
    /**
     * 中文说明
     */
    public description: string = "";

    /**
     * 数据结构
     */
    public meta: Meta = new Meta();

    /**
     * 当前数据源所有数据
     */
    public data: Array<SourceData>;
}

export class SourceData extends BaseModel {
    /**
     * 唯一ID
     */
    public id: number;

    /**
     * 关联到source的id
     */
    public sourceId: number;


    /**
     * 单行数据，根据meta配置的列生成的json格式
     * 例如： {id:1,name:"nick"}
     */
    public row: DataStruct;
}


/**
 * 字段类型
 */
export enum FieldType {
    /**
     * 单行文本
     */
    text = 'text',
    /**
     * 多行文本
     */
    content = 'content',
    /**
     * 随机码
     */
    random = 'random',
    /**
     * 数字
     */
    number = 'number',
    /**
     * key value 数据结构
     */
    map = 'map',
    /**
     * 数据类型
     */
    datetime = 'datetime',
    /**
     * 单选项
     */
    single = 'single',
    /**
     * 多选项
     */
    mutiple = 'mutiple',
    /**
     * 配置一个图片url
     */
    image = 'image',
    /**
     * 上传文件
     */
    file = 'file',
    /**
     * json字段
     */
    json = 'json'
}

/**
 * 字段选项数据来源
 */
export enum FieldDataChannel {
    /**
     * 手动配置
     */
    config = 'config',
    /**
     * 来自数据源
     */
    source = 'source'
}

/**
 * 查询方式
 */
export enum FieldSearchType {
    /**
     * 未指定
     */
    none = 0,
    /**
     * 全匹配(=)
     */       
    equal = 1,
    /**
     * 右模糊(...%)
     */  
    rightMatch = 2,
    /**
     * 左模糊(%...)
     */  
    leftMatch = 3,
    /**
     * 全模糊(%...%)
     */  
    allMatch = 4
}

/**
 * 字段
 */
export class Field extends BaseModel {
    /**
     * 字段名
     */
    public name: string = '';
    /**
     * 中文名称
     */
    public nickName: string = '';
    /**
     * 字段数据类型
     */
    public type: FieldType = FieldType.text;
    /**
     * 搜索类型
     */
    public searchType: FieldSearchType = FieldSearchType.none;
    /**
     * 是否为必选
     */
    public isRequired: boolean = false;

    /**
     * 显示数据时是否隐藏，主要是列表中数据太多会显示慢
     */
    public isHide: boolean = false;

    /**
     * 是否是唯一健，不能重复
     */
    public isUnique: boolean = false;

    /**
     * 是否支持排序
     */
    public sortable: boolean = false;

    /**
     * 最大字符长度
     */
    public maxLength: number = 0;

    /**
     * 默认值
     */
    public default: string = "";

    /**
     * 选项数据来源
     */
    public dataChannel: FieldDataChannel = FieldDataChannel.config;

    /**
     * 字段可选数据，一般用于单选多选数据
     */
    public data: object|string|Array<{label:string, value: string}>|{sourceId:number,label:string,value:string} = '';
    /**
     * 显示顺序
     */
    public sort: number = 0;
}

/**
 * 数据源结构
 */
export class Meta extends BaseModel {
    /**
     * 字段配置
     */
    public Fields: Array<Field> = new Array<Field>();
}

/**
 * 源数据结构
 */
export class DataStruct extends BaseModel {
    [key: string]: string|number|Array<string>|Map<string, string>|Function|DataStruct|{
        label: string,
        value: string | number
    }|Array<DataStruct>
}

/**
 * 获取所有有效的数据源
 */
@decorators.api({
    url: '/api/source/getAll'
})
export class GetAllSourceReq extends req {  
    /**
     * 查询是否有效的
     */
    valid?: EValid;
}

/**
 * 返回数据源
 */
export class GetAllSourceRsp extends rsp {
    data: Source[]
}

/**
 * 获取目录树结构，根结点为root
 * id=0时获取所有的
 */
@decorators.api({
    url: '/api/source/getByRegion'
})
export class GetSourceByRegionReq extends req {  
    regionId: number  
}

/**
 * 目录返回
 */
export class GetSourceByRegionRsp extends rsp {
    data: Source[]
}


/**
 * 获取指定的资源信息
 */
@decorators.api({
    url: '/api/source/getById'
})
export class GetSourceByIdReq extends req {  
    id: number  
}

/**
 * 返回数据源和数据
 */
export class GetSourceByIdRsp extends rsp {
    data: Source
}

/**
 * 获取指定的资源信息
 */
@decorators.api({
    url: '/api/source/getByKey'
})
export class GetSourceByKeyReq extends req {  
    key: string  
}

/**
 * 返回数据源和数据
 */
export class GetSourceByKeyRsp extends rsp {
    data: Source
}

/**
 * 保存资源
 * 如果没有指定ID为新增，指定了就是修改
 */
@decorators.api({
    url: '/api/source/save'
})
export class SaveSourceReq extends req {  
    data: Source 
}

/**
 * 目录返回
 */
export class SaveSourceRsp extends rsp {
    data: Source
}

/**
 * 保存资源数据行
 */
@decorators.api({
    url: '/api/source/saveData'
})
export class SaveSourceDataReq extends req {  
    data: SourceData
}

/**
 * 目录返回
 */
export class SaveSourceDataRsp extends rsp {
    data: SourceData
}

/**
 * 删除数据
 */
@decorators.api({
    url: '/api/source/deleteData'
})
export class DeleteSourceDataReq extends req {  
    id: number
}

/**
 * 删除返回
 */
export class DeleteSourceDataRsp extends rsp {
    data: SourceData
}

/**
 * 发布
 */
@decorators.api({
    url: '/api/source/publish'
})
export class PublishSourceReq extends req {  
    id: number;
    // 发布单条记录，如果指定了记录ID
    dataId?: number;
    scriptContent?: string;
}

/**
 * 发布结果
 */
export class PublishSourceRsp extends rsp {
    data: string
}

 /**
 * 删除
 */
@decorators.api({
    url: '/api/source/delete'
})
export class DeleteSourceReq extends req {
    /**
     * 需要获取目录的id，如果为0则获取所有的
     */
    public id: number;
}

/**
 * 删除
 */
export class DeleteSourceRsp extends rsp {
    data?: Source
}
/**
* 上传文件
*/
@decorators.api({
   url: '/api/source/upload'
})
export class SourceUploadImageReq extends req {
   /**
    * 上传目录，不传就用config中的配置
    */
   public dir?: string;

   // 上传文件指定头信息
   public header?: PlainObject<string>;

    filter?: IFilterFun;

    // 发布的桶
    bucket?: string;

    region?: string;
}

/**
* 上传文件
*/
export class SourceUploadImageRsp extends rsp {
   data?: Source
}

export {
    Source,
}
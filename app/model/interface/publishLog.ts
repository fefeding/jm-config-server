
import BaseModel from './model';
import decorators from '../../lib/decorator';
import { PublishLogState } from './enumType';
import { PageRequest, PageResponse } from './pagination';


export default class PublishLog extends BaseModel {
    
    public id: number;

    
    public sourceId = 0;

    /**
     * 所属域，目录管理
     **/
    
    public content: string = '';

    /**
     * 状态
     **/    
    public state: PublishLogState = PublishLogState.none;

    /**
     * 发布人
     */
    public updater: string = "";

    /**
     * 发布时间
     */
    public updateTime: Date;

    public creater: string = '';

    public createTime: Date;
}



/**
 * 查询发布日志, PaginationResponse
 */
@decorators.api({
    url: '/api/source/searchPublishLog'
})
export class SearchPublishLogReq extends PageRequest {  
    // 如果指定了id则表示拉取单个日志
    id?: number;
    // 查询指定状态数据
    state?: PublishLogState;
    // 查询指定数据源发布日志
    sourceId?: number;
}

/**
 * 查询发布日志返回
 */
export class SearchPublishLogRsp extends PageResponse<PublishLog> {
    
}

export {
    PublishLog,
    PublishLogState
}
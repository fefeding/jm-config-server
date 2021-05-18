import Request from './request';
import Response from './response';

export class PaginationRequest extends Request {
    page?: {
        /** 当前页码, 从 1 开始 */
        current?: number;
        /** 每页数量 */
        size?: number;
    };
}

export class PaginationResponse<T> extends Response {
    data?: {
        // 当前页码展示的列表数据
        list: T[];
        // 总条数
        total: number;
    };
}

// 分页请求参数
export class PageRequest extends Request {
    /**
     * 查询数据页码 
     * 从1开始
     */
    page?: number = 1;

    /**
     * 每页数据展示条数
     */
    size?: number = 20;
}

// 分页查询返回参数
export class PageResponse<T> extends Response {
    /**
     * 当前查询到的数据集合
     */
    data: Array<T> = new Array<T>();

    /**
     * 总符合条件的数据条数
     */
    total?: number = 0;
}

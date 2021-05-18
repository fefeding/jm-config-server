import BaseModel from "./model";
/**
 * 请求接口参数基类
 */
export default class Request extends BaseModel {
    /**
     * 防止csrf的token，现用的是egg标准内的。这里暂不启用
     */
    csrfToken?: string
}

export {
    Request
}

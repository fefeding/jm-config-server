import BaseModel from "./model";
/**
 * API返回结构体基类
 */
export default class Response extends BaseModel {
    /**
     * 接口返回状态码， 0=OK
     */
    ret: number = 0;
    /**
     * 接口返回信息，一般是异常情况返回错误信息
     */
    msg: string = '';

    /**
     * 返回的数据
     */
    data?: any;
}

export class ResponseWithType<T> extends BaseModel {
    /**
     * 接口返回状态码， 0=OK
     */
    ret: number = 0;
    /**
     * 接口返回信息，一般是异常情况返回错误信息
     */
    msg: string = '';

    /**
     * 返回的数据
     */
    data?: T;
}

export {
    Response
}
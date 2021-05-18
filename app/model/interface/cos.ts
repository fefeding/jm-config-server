import { Stream } from 'stream';

// plain object
export type PlainObject<T = any> = { [key: string]: T };

export interface IFilterFun {
    (stream: Stream): string; //返回filename
}
export class IUploadOption {
    dir?: string;
    filter?: IFilterFun;
    bucket?: string;
    region?: string;
    header?: PlainObject<string>;
    stream?: Stream;
}
export class IGetResponse {
    Body: Buffer;
    ETag: string;
    statusCode: number;
    headers: PlainObject;
}

export class ITokenOption {
    region?: string;
    policy?: PlainObject;
    proxy?: string; // http://127.0.0.1:12639
}
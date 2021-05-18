import { ITokenOption, IUploadOption, IGetResponse } from '../model/interface/cos';

import { promisify } from 'util';
import { Context, Service, PlainObject } from 'egg';
import STS from 'qcloud-cos-sts'; // https://www.npmjs.com/package/qcloud-cos-sts
import COS from 'cos-nodejs-sdk-v5';
import { Stream, Duplex, Writable } from 'stream';

let __cos = {}; // 全局唯一，这里用单例

const cosReg = /([\w-]+-\d+)\.cos\.(\w+-\w+)\.myqcloud\.com\/(.*\/)([^\/]+)$/;

export default class Cos extends Service {
    constructor(ctx: Context) {
        super(ctx);
    }
    get configCos(): PlainObject {
        return this.config.cos || {};
    }
    get cos(): COS {
        return this.getCos();
    }

    /**
     * 用桶名获取
     *C OS
     * @param bucket 桶名
     */
    getCos(bucket?: string) {
        if (bucket) {
            if (__cos[bucket]) return __cos[bucket];

            if (Array.isArray(this.configCos)) {
                for (let con of this.configCos) {
                    if (con && con.Bucket === bucket) {
                        //console.log(con);
                        return (__cos[bucket] = new COS(con));
                    }
                }
            } else if (this.configCos.Bucket === bucket) {
                const cos = new COS(this.configCos);
                // console.log(this.configCos);
                __cos[bucket] = cos;
                return cos;
            }
        } else {
            const con = Array.isArray(this.configCos) ? this.configCos[0] : this.configCos;
            const cos = new COS(con);
            //console.log(cos);
            return (__cos[this.configCos.Bucket] = cos);
        }
    }

    /**
     * 获取临时密钥
     */
    async token(opt?: ITokenOption) {
        console.log('Object.assign({}, this.configCos, opt)', Object.assign({}, this.configCos, opt));

        // - secretId	String	云 API 密钥 Id	是
        // - secretKey	String	云 API 密钥 Key	是
        // - policy	Object	要申请的临时密钥，限定的权限范围	是
        // - durationSeconds	Number	要申请的临时密钥最长有效时间，单位秒，默认 1800，最大可设置 7200	否
        // - proxy	String	代理地址，如："http://proxy.example.com:8080"	否
        // - host	String	可以通过改参数指定请求的域名

        return promisify(STS.getCredential)(Object.assign({}, this.configCos, opt));
    }

    /**
     * 上传
     */
    async upload(opt: IUploadOption = {}) {
        const { ctx, configCos } = this;
        const query = ctx.query;
        try {
            // @ts-ignore
            const parts = ctx.is('multipart') ? ctx.multipart({ autoFields: true }) : null;
            const dir = (opt.dir || query.dir || configCos.dir || '').replace(/[\/\\]$/, ''); // 去掉结尾的斜杠
            const list = [];
            const files = [];
            let header: undefined | PlainObject;
            // 这里要取body参数，可以从parts.field取到
            if (query.header) {
                header = JSON.parse(query.header);
            }

            // 如果有传入流，则先上传它
            let stream = opt.stream || (parts ? await parts() : null);
            while (stream) {
                let filename = (stream.filename || 'none').toLowerCase();
                if (opt.filter) {
                    filename = opt.filter(stream);
                }
                const rsp = (_stream =>
                    promisify(this.cos.putObject).call(this.cos, {
                        Bucket: query.bucket || opt.bucket || configCos.Bucket,
                        Region: query.region || opt.region || configCos.Region,
                        Key: `${dir}/${filename}`,
                        Body: _stream,
                        Headers: header || opt.header
                    }))(stream);
                list.push(rsp);
                files.push(filename);

                stream = parts ? await parts() : null;
            }

            const result = await Promise.all(list);
            console.log(result);
            // 更换成访问域名 : https://xxx.xxx.com/
            //@ts-ignore
            const replaceDomain = query.ReplaceDomain || opt.ReplaceDomain || configCos.ReplaceDomain;
            if (list.length > 1) {
                const dict = {};
                files.forEach((name, idx) => {
                    dict[name] = result[idx];
                    dict[name].filename = name;
                    if (replaceDomain)
                        dict[name].url = result[idx].Location.replace(/(http(s)?:\/\/)?[^\/]+\//i, replaceDomain);
                    else dict[name].url = 'https://' + result[idx].Location;
                });
                return dict;
            }
            const obj = result[0];
            obj.filename = files[0];
            if (replaceDomain) obj.url = obj.Location.replace(/(http(s)?:\/\/)?[^\/]+\//i, replaceDomain);
            else obj.url = 'https://' + obj.Location;
            return obj;
        } catch (e) {
            console.log('upload cos error');
            console.log(e);
            throw e;
        }
    }

    /**
     * 解析cos地址
     * @param cosUrl cos地址
     */
    parse(cosUrl: string) {
        const match = cosUrl.match(cosReg) || [];
        return {
            url: match[0],
            bucket: match[1],
            region: match[2],
            dir: match[3],
            filename: match[4]
        };
    }
    /**
     * 下载
     * @param cosUrl cos地址
     */
    async get(cosUrl: string): Promise<IGetResponse | PlainObject> {
        try {
            const opt = this.parse(cosUrl);
            const Key = opt.dir + opt.filename;
            if (!Key) {
                return {
                    ret: -1,
                    msg: 'miss dir and filename'
                };
            }
            // console.log('Key', Key);
            const rsp = await promisify(this.cos.getObject).call(this.cos, {
                Bucket: opt.bucket /* 必须 */,
                Region: opt.region /* 必须 */,
                Key /* 必须 */
            });
            return rsp;
        } catch (e) {
            this.ctx.logger.error('cos get', e.message);
            return {
                ret: -1,
                msg: e.message
            };
        }
    }
    /**
     * 下载
     */
    async headObject(cosUrl: string): Promise<PlainObject> {
        try {
            const opt = this.parse(cosUrl);
            const Key = opt.dir + opt.filename;
            if (!Key) {
                return {
                    ret: -1,
                    msg: 'miss dir and filename'
                };
            }
            // console.log('Key', Key);
            const rsp = await promisify(this.cos.headObject).call(this.cos, {
                Bucket: opt.bucket /* 必须 */,
                Region: opt.region /* 必须 */,
                Key /* 必须 */
            });
            return rsp;
        } catch (e) {
            this.ctx.logger.error('cos headObject', e.message);
            return {
                ret: -1,
                msg: e.message
            };
        }
    }
    /**
     * 通过流的方式下载，注意，该方法之前需要ctx.set('content-type' xx);
     * 参考单测使用
     * @param cosUrl cost原始url
     */
    getStream(cosUrl: string): Duplex | PlainObject {
        try {
            const opt = this.parse(cosUrl);
            const Key = opt.dir + opt.filename;
            if (!Key) {
                return {
                    ret: -1,
                    msg: 'miss dir and filename'
                };
            }
            const Output = new Duplex({
                read() {},
                write(chunk, enc, next) {
                    this.push(chunk);
                    next();
                }
                // getObject 的回调先调，所以放在下面调了
                // final() {
                //     console.log('final')
                //     this.push(null);
                //     this.destroy();
                // }
            });

            this.cos.getObject(
                {
                    Bucket: opt.bucket /* 必须 */,
                    Region: opt.region /* 必须 */,
                    Key /* 必须 */,
                    Output
                },
                function() {
                    Output.push(null);
                    Output.destroy();
                    // 这里set headers没用了
                    // console.log('callback')
                    // ctx.set(data.headers);
                    // console.log(err || data.Body);
                }
            );
            return Output;
        } catch (e) {
            this.ctx.logger.error('cos get', e.message);
            return {
                ret: -1,
                msg: e.message
            };
        }
    }
    /**
     * 获取带token的地址
     */
    async getObjectUrl(cosUrl: string, expires: number): Promise<IGetResponse | PlainObject> {
        try {
            const opt = this.parse(cosUrl);
            const Key = opt.dir + opt.filename;
            if (!Key) {
                return {
                    ret: -1,
                    msg: 'miss dir and filename'
                };
            }
            const rsp = await promisify(this.cos.getObjectUrl).call(this.cos, {
                Bucket: opt.bucket /* 必须 */,
                Region: opt.region /* 必须 */,
                Key /* 必须 */,
                Sign: true,
                Expires: expires || 600
            });
            return rsp;
        } catch (e) {
            this.ctx.logger.error('cos get', e.message);
            return {
                ret: -1,
                msg: e.message
            };
        }
    }
}

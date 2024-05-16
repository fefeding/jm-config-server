import * as vm from 'vm';
import * as moment from 'moment';
import { Context } from 'egg';
import { ProxyResponse } from '@tars/rpc';
import axios from 'axios';
import UploadFileLogOrm from '../model/uploadFileLog';
import { PublishLog, SearchPublishLogReq, SearchPublishLogRsp} from '../model/interface/publishLog';
import { BaseTypeService } from './base';

export default class UploadFileLogService extends BaseTypeService<UploadFileLogOrm> {
    constructor(ctx: Context) {
        super(ctx, UploadFileLogOrm);
    }

    // 上传文件
    async upload(): Promise<Array<UploadFileLogOrm> | UploadFileLogOrm> {

        var dir = this.app.config.cos.prefix || '';// 发布目录
        // 为每个文件增加一个唯一路径
        dir += '/' + (new Date().getTime().toString() + Math.ceil(Math.random() * 1000000));

        const header = {};

        const filename = this.ctx.query.filename || '';
        const contentType = this.ctx.query.contentType || '';

        if(this.ctx.query.fileType === 'image') {
            header['content-type'] = contentType || 'image/png';
            header['access-control-allow-origin'] = '*';
            header['cache-control'] = 'max-age=315360000';
        }
        else if(this.ctx.query.fileType === 'pdf') {
            header['content-type'] = contentType || 'application/pdf';
            header['access-control-allow-origin'] = '*';
        }
        else if(this.ctx.query.fileType === 'json') {
            header['content-type'] = contentType || 'application/json';
            header['access-control-allow-origin'] = '*';
        }

        console.log(header);

        // 调用cos上传
        const result = await this.ctx.service.cos.upload({
            //filename,
            dir,
            header: header
        });

        if(Array.isArray(result)) {
            const logs = [];
            for(let r of result) {
                logs.push(this.writeLog(r));
            }
            return logs;
        }
        else {
            return this.writeLog(result);
        }
    }

    // 上传base64文件
    async uploadBase64(base64, filename?: string, filtType?: string): Promise<UploadFileLogOrm> {

        var dir = this.app.config.cos.prefix || '';// 发布目录
        // 为每个文件增加一个唯一路径
        dir += '/' + (new Date().getTime().toString() + Math.ceil(Math.random() * 1000000));

        const header = {};

        if(filtType === 'pdf') {
            header['content-type'] = 'application/pdf';
            header['access-control-allow-origin'] = '*';
        }
        else {
            header['content-type'] = 'image/png';
            header['access-control-allow-origin'] = '*';
            header['cache-control'] = 'max-age=315360000';
        }

        console.log(header);

        // 调用cos上传
        const result = await this.ctx.service.cos.uploadBase64(base64, {
            dir,
            filename,
            header: header
        });

        return this.writeLog(result);
    }

    // 上传文本文件
    async uploadString(text, filename?: string, contentType='text/plain', dir:string=''): Promise<UploadFileLogOrm> {

        if(!dir) {
            dir = this.app.config.cos.prefix || '';// 发布目录
            // 为每个文件增加一个唯一路径
            dir += '/' + (new Date().getTime().toString() + Math.ceil(Math.random() * 1000000));
        }

        const header = {};
        header['content-type'] = contentType;
        header['access-control-allow-origin'] = '*';

        console.log(header);

        // 调用cos上传
        const result = await this.ctx.service.cos.uploadString(text, {
            dir,
            filename,
            header: header
        });

        return this.writeLog(result);
    }

    // 保存远程图片
    async updateImage(url: string, filename?: string, contentType='contentType') {
        var dir = this.app.config.cos.prefix || '';// 发布目录
        // 为每个文件增加一个唯一路径
        dir += '/' + (new Date().getTime().toString() + Math.ceil(Math.random() * 1000000));

        const header = {};

        header['content-type'] = contentType || 'image/png';
        header['access-control-allow-origin'] = '*';
        header['cache-control'] = 'max-age=315360000';

        const res = await axios.get(url, { responseType: 'stream'});

        // 调用cos上传
        const result = await this.ctx.service.cos.upload({
            stream: res.data,
            dir,
            filename,
            header: header
        });
        return this.writeLog(result);
    }

    // 写入上传日志
    async writeLog(file): Promise<UploadFileLogOrm> {
        const log = new UploadFileLogOrm();
        log.location = file.Location;
        log.url = file.url || `https://${file.Location}`;
        log.filename = file.filename;
        log.creator = log.updater = this.ctx.currentSession.user.staffId.toString();
        log.etag = (file.ETag || '').replace(/'|"/g, '');

        console.log(log);

        await this.save(log);

        return log;
    }

    // 查询日志
    async searchLog(req: SearchPublishLogReq): Promise<SearchPublishLogRsp> {
        const rsp = new SearchPublishLogRsp();

        const options = {
            where: {}
        };

        options['select'] = [
            "id", "sourceId", "state", "content", "updater", "modifyTime", "creator", "createTime"
        ];

        if(req.state > 0) {
            options.where['state'] = req.state;
        }
        if(req.sourceId > 0) {
            options.where['sourceId'] = req.sourceId;
        }
        //if(req.id > 0) {
        //    options['select'].push('content');
        //    options.where['id'] = req.id;
        //}

        options['order'] = {
            modifyTime: "DESC"
        };

        const page = (req.page < 1? 1: req.page) - 1; // 传入是从1 起的，我们转为从0起
        const size = req.size < 1 ? 20:
                    (req.size > 100 ? 100: req.size); // size 不能超过100，必须大于1

        options['skip'] = page * size;
        options['take'] = size;

        const [data, totalCount] = await this.findAndCount(options);

        rsp.total = totalCount;
        rsp.data = PublishLog.fromArray<PublishLog>(data, PublishLog);
        return rsp;
    }
}

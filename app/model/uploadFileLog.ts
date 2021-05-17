'use strict';
/**
 * 发布日志
 */
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

import { Meta, BaseORM, PublishLogState } from '@jv/jv-models';

@Entity('t_upload_file_log')
export default class UploadFileLog extends BaseORM {
    @PrimaryGeneratedColumn({
        name: 'Fid',
        comment: '唯一健'
    })
    public id: number;

    @Column({
        name: 'Furl',
        type: 'varchar',
        length: 512,
        comment: '发布的文件访问路径'
    })
    public url = '';

    @Column({
        name: 'Flocation',
        type: 'varchar',
        length: 512,
        comment: 'cos原始路径'
    })
    public location = '';

    @Column({
        name: 'Ffilename',
        type: 'varchar',
        length: 128,
        comment: '文件名称'
    })
    public filename: string = '';

    @Column({
        name: 'Fetag',
        type: 'varchar',
        length: 64,
        comment: '文件名称'
    })
    public etag: string = '';
}

export { UploadFileLog };

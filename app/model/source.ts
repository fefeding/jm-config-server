'use strict';
import { Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm';

import { Meta, BaseORM } from '@jv/jv-models';

@Entity('t_source')
export default class Source extends BaseORM {
    @PrimaryGeneratedColumn({
        name: 'Fid',
        comment: '数据唯一健'
    })
    public id: number;

    @Column({
        name: 'Fkey',
        type: 'varchar',
        length: 64,
        comment: '索引健值'
    })
    public key: string = '';

    @Column({
        name: 'Fdescription',
        type: 'varchar',
        length: 64,
        comment: '说明文案'
    })
    public description: string = '';

    @Column({
        name: 'Fpublish_script',
        type: 'text',
        comment: '发布脚本'
    })
    public publishScript: string = '';

    /**
     * 所属域，目录管理
     **/
    @Column({
        name: 'Fregion_id',
        type: 'int',
        comment: '所属目录ID'
    })
    public regionId: number;

    @Column({
        name: 'Fmeta',
        type: 'json',
        comment: '数据源结构'
    })
    public meta: Meta;
}

export { Source };

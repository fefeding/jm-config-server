'use strict';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

import BaseORM from './baseORM';

/**
 * 数据源域目录
 */
@Entity('t_source_region')
export default class SourceRegion extends BaseORM {

    @PrimaryGeneratedColumn({
        name: 'Fid',
        comment: '唯一健'
    })
    public id: number;

    /**
     * 父目录ID
     */
    @Column({
        name: 'Fparent_id',
        type: 'int',
        default: 0,
        comment: '父目录'
    })
    public parentId: number;

    /**
     * 目录名
     */
    @Column({
        name: 'Fname',
        type: 'varchar',
        length: 64,
        comment: '目录名'
    })
    public name: string;
}

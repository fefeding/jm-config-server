'use strict';
/**
 * 发布日志
 */
import { Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm';

import BaseORM from './baseORM';
import { PublishLogState } from './interface/enumType';

@Entity('t_publish_log')
export default class PublishLog extends BaseORM {
    @PrimaryGeneratedColumn({
        name: 'Fid',
        comment: '数据唯一健'
    })
    public id: number;

    @Column({
        name: 'Fsource_id',
        type: 'int',
        comment: '发布数据源ID'
    })
    public sourceId = 0;

    /**
     * 所属域，目录管理
     **/
    @Column({
        name: 'Fcontent',
        type: 'longtext',
        comment: '日志内容'
    })
    public content: string = '';

    /**
     * 状态
     **/
    @Column({
        name: 'Fstate',
        type: 'tinyint',
        comment: '日志内容'
    })
    public state: PublishLogState = PublishLogState.none;
}

export { PublishLog };

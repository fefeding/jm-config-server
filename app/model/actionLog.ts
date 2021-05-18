'use strict';
/**
 * 发布日志
 */
import { Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm';

import BaseORM from './baseORM';

/**
 * 日志类型
 */
export enum ELogType {
    None = 0,
    /**
     * 操作微信菜单
     */
    WXMenu = 1,
    /**
     * 操作中金白名单
     */
    ZJWhite = 2,
    /**
     * 查询客户信息
     */
    QueryCustomer = 3,
    /**
     * 金腾白名单包管理操作
     */
    JTWhite = 4,
    /**
     * 活动折扣信息
     */
    ActDiscount = 5
}

@Entity('t_action_log')
export default class ActionLog extends BaseORM {
    @PrimaryGeneratedColumn({
        name: 'Fid',
        comment: '数据唯一健'
    })
    public id: number;

    @Column({
        name: 'Ftarget_id',
        type: 'varchar',
        comment: '关联的业务ID'
    })
    public targetId = '';

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
     * 类型
     **/
    @Column({
        name: 'Flog_type',
        type: 'tinyint',
        comment: '类型'
    })
    public logType: ELogType = ELogType.None;
}

export { ActionLog };

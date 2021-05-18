'use strict';
import { Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm';

import BaseModel from './interface/model';
import { EValid } from './interface/enumType';

/**
 * 所有typeorm model的基类，
 * 一般数据orm类不写在当前项目内，这里只是为了方便大家都引用同一个类
 */
export default class BaseORM extends BaseModel {    

    @Column({
        name: 'Fvalid',
        type: 'tinyint',
        comment: '是否有效',
        default: EValid.Valid
    })
    public valid: EValid = EValid.Valid;

    @Column({
        name: 'Fcreator',
        type: 'varchar',
        length: '64',
        comment: '创建人',
        default: ''
    })
    public creator: string = '';

    @Column({
        name: 'Fupdater',
        type: 'varchar',
        length: '64',
        comment: '修改人',
        default: ''
    })
    public updater: string = '';

    @CreateDateColumn({
        name: 'Fcreate_time',
        type: 'datetime',
        precision: 0,
        default: () => 'CURRENT_TIMESTAMP',
        comment: '创建时间'
    })
    public createTime: Date;

    @UpdateDateColumn({
        name: 'Fmodify_time',
        type: 'datetime',
        precision: 0,
        default: () => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        comment: '修改时间'
    })
    public modifyTime: Date;
}


export {
    BaseORM
}

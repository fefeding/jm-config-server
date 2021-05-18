'use strict';
import { Entity, Index, UpdateDateColumn, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm';

import BaseORM from './baseORM';
import { DataStruct } from './interface/model';

@Entity('t_source_data')
export default class SourceData extends BaseORM {
    @PrimaryGeneratedColumn({
        name: 'Fid',
        comment: '数据唯一健'
    })
    public id: number;

    /**
     * 关联到source的id
     */
    @Index()
    @Column({
        name: 'Fsource_id',
        type: 'int',
        comment: '数据源ID'
    })
    public sourceId: number;


    /**
     * 单行数据，根据meta配置的列生成的json格式
     * 例如： {id:1,name:"nick"}
     */
    @Column({
        name: 'Frow',
        type: 'json',
        comment: '数据源ID'
    })
    public row: DataStruct;
}

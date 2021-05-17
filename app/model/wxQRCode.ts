'use strict';
import { Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm';

import { Meta, BaseORM } from '@jv/jv-models';

@Entity('t_wx_qrcode')
export default class wxQRCode extends BaseORM {
    @PrimaryGeneratedColumn({
        name: 'Fid',
        comment: '数据唯一健'
    })
    public id: number;

    @Column({
        name: 'Fapp_id',
        type: 'varchar',
        length: 50,
        comment: '公众号appid'
    })
    public appId: string = '';

    @Column({
        name: 'Faction_name',
        type: 'varchar',
        length: 50,
        comment: '二维码类型，QR_SCENE为临时的整型参数值，QR_STR_SCENE为临时的字符串参数值，QR_LIMIT_SCENE为永久的整型参数值，QR_LIMIT_STR_SCENE为永久的字符串参数值'
    })
    public actionName: 'QR_SCENE' | 'QR_STR_SCENE' | 'QR_LIMIT_SCENE' | 'QR_LIMIT_STR_SCENE' = 'QR_LIMIT_STR_SCENE';

    @Column({
        name: 'Faction_info',
        type: 'json',
        comment: '二维码详细信息'
    })
    public actionInfo: {
        scene: {
            /** 场景值ID，临时二维码时为32位非0整型，永久二维码时最大值为100000（目前参数只支持1--100000） */
            scene_id?: number,
            /** 场景值ID（字符串形式的ID），字符串类型，长度限制为1到64 */
            scene_str?: string,
        },
        // 渠道描述
        scene_description?: string
    };

    /**
     * 获取的二维码ticket，凭借此ticket可以在有效时间内换取二维码。
     * HTTP GET请求（请使用https协议）https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=TICKET 提醒：TICKET记得进行UrlEncode
     **/
    @Column({
        name: 'Fticket',
        type: 'varchar',
        length: 256,
        comment: '获取的二维码ticket，凭借此ticket可以在有效时间内换取二维码。'
    })
    public ticket: string;

    @Column({
        name: 'Fexpire_seconds',
        type: 'int',
        comment: '该二维码有效时间，以秒为单位。 最大不超过2592000（即30天）。'
    })
    public expireSeconds = 0;

    @Column({
        name: 'Furl',
        type: 'varchar',
        length: 256,
        comment: '二维码图片解析后的地址，开发者可根据该地址自行生成需要的二维码图片'
    })
    public url: string;
}

export { wxQRCode };

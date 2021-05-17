
import { resolveAny } from 'dns';
import { Context } from 'egg';
import wxQRCodeOrm from '../model/wxQRCode';
import { BaseTypeService } from './base';

export default class wxQRCodeService extends BaseTypeService<wxQRCodeOrm> {
    constructor(ctx: Context) {
        super(ctx, wxQRCodeOrm);
    }

    // 生成二维码
    async create(params: {
        app_id: string
        action_name: 'QR_SCENE' | 'QR_STR_SCENE' | 'QR_LIMIT_SCENE' | 'QR_LIMIT_STR_SCENE',
        scene_id?: number,
        scene_str?: string,
        scene_description?: string,
        expire_seconds?: number
    }) {

        // 公众号appid
        params.app_id = params.app_id || this.ctx.app.config.jvWxConfig.appId;
        
        const accessToken = await this.ctx.helper.getWxAccessToken(params.app_id);
        if(accessToken) {
            const url = `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${accessToken}`;

            const actionInfo = {
                scene: {},
                scene_description: ''
            } as {
                scene: {
                    scene_id?: number,
                    scene_str?: string,
                },
                scene_description?: string
            };
            
            if(params.scene_id > 0) {
                actionInfo.scene.scene_id = params.scene_id || 0;
            }
            else if(params.scene_str) {
                actionInfo.scene.scene_str = params.scene_str;
            }

            const reqData = {
                "action_name": params.action_name,
                "expire_seconds": params.expire_seconds || 0,
                "action_info": actionInfo
            };

            console.log(reqData);

            const result = await this.ctx.helper.curl<any, {
                errcode: number,
                errmsg: string,
                ticket: string,
                expire_seconds: number,
                url: string
            }>(url, {
                // 自动解析 JSON response
                responseType: 'json',
                data: reqData
            });

            console.log(result);

            if(result.errcode && result.errcode != 0) {
                return result;
            }

            const orm = new wxQRCodeOrm();
                orm.actionName = params.action_name;
                orm.appId = params.app_id;
                orm.expireSeconds = result.expire_seconds || 0;
                orm.ticket = result.ticket;
                orm.url = result.url;
                orm.creator = orm.updater = this.ctx.currentSession.user.staffId.toString();

            actionInfo.scene_description = params.scene_description || '';
            orm.actionInfo = actionInfo;    

            try {
                
                const res = await this.save(orm);
                console.log(res, orm);
            }
            catch(e) {
                this.ctx.logger.error(e);
                console.log(e);
            }

            return orm;
        }
        else {
            throw Error('accessToken获取失败');
        }
    }
}

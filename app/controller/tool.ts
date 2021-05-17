const request = require('request');
const FormData = require('form-data');
import { Context, Controller } from "egg";
import wxQRCodeOrm from "../model/wxQRCode";
import { decorators } from "jm-egg-framework";
import {
    GetUserInfoReq,
    GetUserInfoRes
} from "@jv/jv-models/config-system/tools";
import {
    FindConsultDataReq,
    ConsultDataRsp
} from "@jv/jv-models/ic-center/consult";
import {
    GetConsultFormalUserReq,
    ConsultFormalUserRsp
} from "@jv/jv-models/ic-center/consultFormalUser";
import {
    GetConsultPotentialUserReq,
    ConsultPotentialUserRsp
} from "@jv/jv-models/ic-center/consultPotentialUser";
import {
    GetTotalUserInfoReq,
    GetTotalUserInfoRes
} from "@jv/jv-models/mid-user-center/source/unite";

import {
    GetAllWxUserIdReq,
    GetAllWxUserIdRes,
    GetAccessTokenReq,
    GetAccessTokenRes
} from '@jv/jv-models/ic-center/utils/wx';


import { JV as ZtAcctTradeProxy } from '../tars/ZtAcctTradeProxyServantProxy';

import { ELogType } from "../model/actionLog";

const Registry = require("@tars/registry");

export default class ToolController extends Controller {
    // 查询用户信息
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async queryLctBind(
        ctx: Context,
        req: GetUserInfoReq
    ): Promise<GetUserInfoRes> {
        const res = new GetUserInfoRes();
        res.ret = 0;
        res.msg = "";

        if (!req.accountId && !req.uid && !req.loginId && !req.telNo && !req.idNo) {
            return res;
        }

        const usetOpt = {
            data: new GetTotalUserInfoReq({ loginId: req.loginId, uid: req.uid, accountId: req.accountId, telNo: req.telNo, idNo: req.idNo, brokerId: 2 }),
            // baseURL: "http://127.0.0.1:7001",
            tarsConfig: {
                servant: this.app.config.userCenterServer.servant,
                client: this.app.config.tars.client
            }
        }

        const userRes = await ctx.helper.curl<GetTotalUserInfoReq, GetTotalUserInfoRes>(usetOpt);

        if (userRes.ret !== 0) {
            res.ret = userRes.ret;
            res.msg = userRes.msg;
            return res;
        }

        if (!userRes.data) {
            return res;
        }

        let userData = userRes.data;
        let accountId = '';
        let loginId = '';

        if (userData.openInfo || userData.clientInfo) {
            if (userData.openInfo) {
                accountId = userData.openInfo.accountId;
            }
            if (userData.clientInfo) {
                accountId = userData.clientInfo.mainAccountId;
            }
        }

        if (userData.lctbind || userData.wxpay || userData.openInfo) {
            loginId = (userData.lctbind || userData.wxpay || userData.openInfo).loginId;
        }

        let potentialUser: ConsultPotentialUserRsp;
        let formalUser: ConsultFormalUserRsp;
        if (accountId) {
            const formalOpt = {
                data: new GetConsultFormalUserReq({
                    accountId: accountId
                }),
                tarsConfig: {
                    servant: this.app.config.icCenterServer.servant,
                    client: this.app.config.tars.client
                }
            };

            formalUser = await ctx.helper.curl<GetConsultFormalUserReq, ConsultFormalUserRsp>(formalOpt)
        } else if (loginId) {
            const potentialOpt = {
                data: new GetConsultPotentialUserReq({ loginId: loginId }),
                tarsConfig: {
                    servant: this.app.config.icCenterServer.servant,
                    client: this.app.config.tars.client
                }
            };

            potentialUser = await ctx.helper.curl<GetConsultPotentialUserReq, ConsultPotentialUserRsp>(potentialOpt);
        }

        ctx.service.actionLog.insert(loginId, `查询客户信息,${JSON.stringify(userData)}`, ELogType.QueryCustomer);

        if (!potentialUser && !formalUser) {
            // 没有投顾客户关系
            return res;
        }

        let icId = '';

        if (formalUser && formalUser.data) {
            icId = String(formalUser.data.consultId);
        } else if (potentialUser && potentialUser.data) {
            icId = String(potentialUser.data.consultId);
        }

        const icOpt = {
            data: new FindConsultDataReq({ consultId: icId }),
            tarsConfig: {
                servant: this.app.config.icCenterServer.servant,
                client: this.app.config.tars.client
            }
        };
        const icRes: ConsultDataRsp = await ctx.helper.curl<FindConsultDataReq, ConsultDataRsp>(icOpt)

        res.data = {
            loginId: loginId,
            lct: userRes.data.lctbind,
            consult: icRes.data,
            cert: userRes.data.certInfo,
            client: userRes.data.clientInfo,
            open: userRes.data.openInfo,
            wxpay: userRes.data.wxpay,
        };

        return res;
    }

    // 长链接转短链接
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async long2ShortUrl(
        ctx: Context,
        params: {
            url: string;
        }
    ) {
        if (!params.url) {
            throw Error("url参数不可为空");
        }

        const accessToken = await this.ctx.helper.getWxAccessToken();
        if (accessToken) {
            const url = `https://api.weixin.qq.com/cgi-bin/shorturl?access_token=${accessToken}`;
            const result = await this.ctx.helper.curl<any, any>(url, {
                // 自动解析 JSON response
                responseType: "json",
                data: {
                    action: "long2short",
                    long_url: params.url
                }
            });

            return result;
        }
        return null;
    }

    // 生成公众号二维码
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async createWXQrcode(
        ctx: Context,
        params: {
            app_id: string;
            action_name:
                | "QR_SCENE"
                | "QR_STR_SCENE"
                | "QR_LIMIT_SCENE"
                | "QR_LIMIT_STR_SCENE";
            scene_id?: number;
            scene_str?: string;
            scene_description?: string;
            expire_seconds?: number;
        }
    ) {
        return await ctx.service.wxQRCode.create(params);
    }

    // 生成公众号二维码
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async getAllQRCode(ctx: Context) {
        const data = await ctx.service.wxQRCode.getAll();
        if(data && data.length) {
            data.sort((q1, q2) => {
                return q1.createTime > q2.createTime? -1: 1;
            });
        }
        return data;
    }

    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async getService(ctx: Context) {
        const registry = Registry.New();

        registry.setLocator(ctx.app.config.tars.client.locator); // 设置主控
        //resetLocator 可以重置locator

        const setName = ctx.query.setname || "";
        const objName =
            ctx.query.objname || "JV.RedisProxySvr.RedisProxyServantObj";

        const result = {
            setName,
            objName,
            endPoints: []
        };
        if (setName) {
            const obj = await registry.findObjectByIdInSameSet(
                objName,
                setName
            );
            result.endPoints = obj.response.arguments.activeEp.value;
        } else {
            const obj = await registry.findObjectByIdInSameGroup(objName);
            result.endPoints = obj.response.arguments.activeEp.value;
        }
        return result;
    }

    // 查询公众号菜单
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async queryWXMenus(ctx: Context) {

        const accessToken = await this.ctx.helper.getWxAccessToken();
        if (accessToken) {
            const url = `https://api.weixin.qq.com/cgi-bin/get_current_selfmenu_info?access_token=${accessToken}`;
            const result = await this.ctx.helper.curl<any, any>(url, {
                // 自动解析 JSON response
                responseType: "json",
            });

            return result;
        }
        return null;
    }

    // 发布公众号菜单
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async publishyWXMenus(ctx: Context, menus: any) {
        if(ctx.app.config.jvCommon.env === 'test') {
            throw Error('测试环境不能发布菜单');
        }
        ctx.logger.info('发布公众号菜单');
        const accessToken = await this.ctx.helper.getWxAccessToken();
        if (accessToken) {
            // 先删除菜单才能再创建
            // let url = `https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${accessToken}`;
            // let result = await this.ctx.helper.curl<any, any>(url, {
            //     // 自动解析 JSON response
            //     responseType: "json",
            // });
            // // 删除成功再创建
            // if(result.errcode == 0) {
                const url = `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${accessToken}`;
                let result = await this.ctx.helper.curl<any, any>(url, {
                    // 自动解析 JSON response
                    responseType: "json",
                    data: menus
                });

                ctx.service.actionLog.insert('0', `发布微信公众号菜单${JSON.stringify(menus)},${JSON.stringify(result)}`, ELogType.WXMenu);

                return result;
            //}
        }
        return null;
    }

    /**
     * 获取微信公众号token
     */
    @decorators.checkApiToken(true)
    @decorators.checkApiLogin(false)
    public async getWXAccessToken(ctx: Context) {
        // 如果有指定ip白名单，则过滤
        if (
            ctx.app.config.wxTokenIPWhitelist &&
            ctx.app.config.wxTokenIPWhitelist.ips &&
            ctx.app.config.wxTokenIPWhitelist.ips.length
        ) {
            if (!ctx.app.config.wxTokenIPWhitelist.ips.includes(ctx.ip)) {
                throw Error("非白名单IP," + ctx.ip);
            }
        }

        const accessToken = await this.ctx.helper.getWxAccessToken(
            ctx.query.appid || ""
        );
        const jsapiTicket = await this.ctx.helper.getJsApiTicket(
            ctx.query.appid || ""
        );
        return {
            accessToken,
            jsapiTicket
        };
    }

    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async createToken(ctx: Context) {
        return ctx.helper.createApiToken(ctx.app.config.apiAccess.accessKey);
    }

    // 添加中金白名单
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async addZJWhite(ctx: Context, data: ZtAcctTradeProxy.TAddWhiteListReq) {

        if(!data.name || !data.id_card) {
            throw Error('名称和证件号码不可为空');
        }

        const config = {
            setName: '',
            objName: 'JV.ZtProxySvr.ZtAcctTradeProxyServantObj'
        };

        const proxy = this.ctx.tarsClient.stringToProxy(
            ZtAcctTradeProxy.ZtAcctTradeProxyServantProxy,
            config.objName,
            config.setName || ''
        );

        // 添加白名单
        const req = new ZtAcctTradeProxy.TAddWhiteListReq();
        req.name = data.name;
        req.id_type = data.id_type || 0;
        req.id_card = data.id_card;
        const res = await proxy.addWhiteList(req);
        console.log(res.response);
        
        const id = data.id_card.replace(/[\W\w]{13}/, '******');
        ctx.service.actionLog.insert(id, `添加白名单${data.name},${JSON.stringify(res.response.arguments.rsp)}`, ELogType.ZJWhite);
        return res.response.arguments.rsp;
    }

    // 删除中金白名单
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async deleteZJWhite(ctx: Context, data: ZtAcctTradeProxy.TDeleteWhiteListReq) {

        if(!data.name || !data.id_card) {
            throw Error('名称和证件号码不可为空');
        }

        const config = {
            setName: '',
            objName: 'JV.ZtProxySvr.ZtAcctTradeProxyServantObj'
        };

        const proxy = this.ctx.tarsClient.stringToProxy(
            ZtAcctTradeProxy.ZtAcctTradeProxyServantProxy,
            config.objName,
            config.setName || ''
        );

        // 添加白名单
        const req = new ZtAcctTradeProxy.TDeleteWhiteListReq();
        req.name = data.name;
        req.id_type = data.id_type || 0;
        req.id_card = data.id_card;
        const res = await proxy.deleteWhiteList(req);
        console.log(res.response);
        const id = data.id_card.replace(/[\W\w]{13}/, '******');
        ctx.service.actionLog.insert(id, `删除白名单${data.name},${JSON.stringify(res.response.arguments.rsp)}`, ELogType.ZJWhite);
        return res.response.arguments.rsp;
    }

    // 查询中金白名单
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async queryZJWhite(ctx: Context, data: ZtAcctTradeProxy.TQueryWhiteListReq) {

        if(!data.name || !data.id_card) {
            throw Error('名称和证件号码不可为空');
        }

        const config = {
            setName: '',
            objName: 'JV.ZtProxySvr.ZtAcctTradeProxyServantObj'
        };

        const proxy = this.ctx.tarsClient.stringToProxy(
            ZtAcctTradeProxy.ZtAcctTradeProxyServantProxy,
            config.objName,
            config.setName || ''
        );

        // 添加白名单
        const req = new ZtAcctTradeProxy.TQueryWhiteListReq();
        req.name = data.name;
        req.id_type = data.id_type || 0;
        req.id_card = data.id_card;
        const res = await proxy.queryWhiteList(req);
        //console.log('111',res.response);
        const id = data.id_card.replace(/[\W\w]{13}/, '******');
        delete res.response.arguments.rsp.query_result;
        ctx.service.actionLog.insert(id, `查询白名单${data.name},${JSON.stringify(res.response.arguments.rsp)}`, ELogType.ZJWhite);
        return res.response.arguments.rsp;
    }

    // IC群发消息给客户
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async sendMsgToCustomer(ctx: Context, data: any) {

        const userReq = new GetAllWxUserIdReq();
        console.log('sendMsgToCustomer', data);
        if(Array.isArray(data.loginIds)) userReq.loginId = Array.isArray(data.loginIds);
        else {
            userReq.loginId = data.loginIds.split(/[\s,;]/g);// 用换行或,;分隔
        }
        //userReq.loginId = Array.isArray(data.loginIds)?data.loginIds: [data.loginIds];
        userReq.companyId = data.companyId;
        const opt = {
            data: userReq,
            tarsConfig: {
                servant: this.app.config.icCenterServer.servant,
                client: this.app.config.tars.client
            }
        };

        const res = await ctx.helper.curl<GetAllWxUserIdReq, GetAllWxUserIdRes>(opt);
        ctx.log.info(res);
        const senderData = {} as any;// 根据ic分组发送消息
        if(res.ret !== 0) {
            throw res;
        }

        const tokenReq = new GetAccessTokenReq();
        tokenReq.companyId = data.companyId;
        const tokenopt = {
            data: tokenReq,
            tarsConfig: {
                servant: this.app.config.icCenterServer.servant,
                client: this.app.config.tars.client
            }
        };
        console.log('req token', tokenopt);
        const tokenRes = await ctx.helper.curl<GetAccessTokenReq, GetAccessTokenRes>(tokenopt);
        console.log(tokenRes);

        if(tokenRes.ret !== 0) {
            throw tokenRes;
        }

        let imageUploadUrl = data.image;
        // 如果本业就是企业微信的资源，则不用处理
        if(!/^https:\/\/wework.qpic.cn\//.test(imageUploadUrl)) {
            // 先把图片上传到企业微信素材库内
            const imageStream = request(imageUploadUrl);
            const form = new FormData();
            const picName = 'image_' + Date.now();
            form.append('name', picName);
            form.append(picName + '.jpg', imageStream);
            const upopt =  {
                method: 'POST',
                dataType: 'json',
                headers: form.getHeaders(),
                stream: form
            } as any;
            //console.log(upopt);
            
            const imageRes = await ctx.curl(`https://qyapi.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${tokenRes.data.access_token}`, upopt);
            console.log(imageRes);
            if(imageRes.data.errcode != 0) {
                return {
                    ret: 10001,
                    msg: imageRes.data.errcode + imageRes.data.errmsg
                };
            }
            else {
                imageUploadUrl = imageRes.data.url;
            }
        }

        for(const u of res.data) {
            const sender = senderData[u.icUserId] || (senderData[u.icUserId] = {
                "chat_type":"single",
                "external_userid": [],
                "sender": u.icUserId,
                "attachments": [
                    {
                        "msgtype": "image",
                        "image": {
                            "pic_url": imageUploadUrl
                        }
                    }
                ]
            });
            if(!sender.external_userid.includes(u.wxUserId)) sender.external_userid.push(u.wxUserId);
        }

        

        for(const ic in senderData) {
            if(typeof ic !== 'string') continue;
            const data = senderData[ic];
            if(!data.external_userid.length) continue;

            const ret = await this.sendWkMsgToCustomer(data, tokenRes.data.access_token);
            if(ret.errcode != 0) {
                return {
                    ret: 10001,
                    msg: ret.errcode + ret.errmsg
                };
            }
            
        }
        return senderData;
    }

    private async sendWkMsgToCustomer(data: any, accessToken?: string): Promise<any> {
        console.log('sendWkMsgToCustomer', data);
        const res = await this.ctx.helper.curl({
            url: `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/add_msg_template?access_token=${accessToken}`,
            data: data
        });
        this.ctx.log.info(data, res);
        return res;
    }
}

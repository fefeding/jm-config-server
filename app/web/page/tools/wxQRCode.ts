import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import * as moment from 'moment';

@Component({
    components: {
        
    }
})
export default class WXQRCodePage extends Vue {
    // 二维码类型
    actions = [
        //最多10万个
        {
            action: 'QR_LIMIT_STR_SCENE',
            name: '字符串串参数永久二维码'
        },{
            action: 'QR_LIMIT_SCENE',
            name: '整型参数永久二维码'
        },
        {
            action: 'QR_STR_SCENE',
            name: '字符串参数临时二维码'
        },
        {
            action: 'QR_SCENE',
            name: '整型参数临时二维码'
        }
    ]
    // 当前生成二维码类型
    //二维码类型，QR_SCENE为临时的整型参数值，QR_STR_SCENE为临时的字符串参数值，QR_LIMIT_SCENE为永久的整型参数值，QR_LIMIT_STR_SCENE为永久的字符串参数值
    action_name = "QR_LIMIT_STR_SCENE";
    // 渠道信息
    scene_str = "";
    // 渠道描述
    scene_description = "";
    // 超时时间
    expire_seconds = 0; //秒

    resultStr = '';
    // 所有历名二维码
    qrcodeData = new Array<any>();

    async createQRCode() {
        if(!this.action_name) {
            alert('选择类型');
            return false;
        }
        if(!this.scene_str) {
            alert('请输入渠道信息');
            return false;
        }   

        // 如果是整型参数，则校验参数必须是整型
        let scene_id = 0;
        if(this.action_name == 'QR_LIMIT_SCENE' || this.action_name == 'QR_SCENE') {
            scene_id = parseInt(this.scene_str, 10);
            if(!scene_id) {
                alert('请输入正确的整型渠道');
                return;
            }
            if(this.action_name == 'QR_LIMIT_SCENE' && scene_id > 100000) {
                alert('永久二维码整型的渠道最大支持100000');
                return;
            }
        }

        const res = await this.$ajax.requestApi<any, any>({
            app_id: '',
            action_name: this.action_name,
            scene_str: this.scene_str,
            scene_id,
            scene_description: this.scene_description,
            expire_seconds: this.expire_seconds || 0,
        }, {
            url: '/api/tool/createWXQrcode'
        });
        console.log(res);

        if(!res || res.ret !== 0 || (res.data && res.data.errcode && res.data.errcode != 0)) {
            this.resultStr = res.msg + res.data.errmsg;
        }
        else {
            this.resultStr = JSON.stringify(res.data);
            this.refreshQRCodes();
        }

    }

    // 刷新所有二维码
    async refreshQRCodes() {
        const res = await this.$ajax.requestApi<any, {
            ret: number,
            msg: string,
            data: Array<any>
        }>({}, {
            url: '/api/tool/getAllQRCode'
        });
        if(res.ret == 0) {
            this.qrcodeData = res.data;
        }
    }

    getActionName(action) {
        for(const a of this.actions) {
            if(a.action == action) {
                return a.name;
            }
        }
        return '';
    }

    renderDate(v) {
        const d = moment(v);
        return d.isValid()?d.format('YYYY-MM-DD HH:mm:ss'):v;
    }

    mounted () {
        this.refreshQRCodes();
    }

}

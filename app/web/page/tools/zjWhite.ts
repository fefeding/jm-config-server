import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import * as moment from 'moment';
import StaffUserName from '@jv/jv-account/app/web/component/controls/user';

@Component({
    components: {
        StaffUserName
    }
})
export default class WXQRCodePage extends Vue {
    // 证件类型
    idTypes = [
        {
            value: '0',
            label: '身份证'
        },{
            value: '1',
            label: '护照',
            disabled: true
        },
        {
            value: '2',
            label: '军官证',
            disabled: true
        },
        {
            value: '3',
            label: '士兵证',
            disabled: true
        },
        {
            value: '4',
            label: '回乡证',
            disabled: true
        },
        {
            value: '5',
            label: '户口本',
            disabled: true
        },
        {
            value: '6',
            label: '外国护照',
            disabled: true
        },
        {
            value: '7',
            label: '解放军文职士部',
            disabled: true
        },
        {
            value: '8',
            label: '临时身份证',
            disabled: true
        },
        {
            value: '9',
            label: '武警文职干部',
            disabled: true
        },
        {
            value: '10',
            label: '工商营业执照',
            disabled: true
        },
        {
            value: '10',
            label: '社团法人注册登记证书',
            disabled: true
        }
    ];
    // 操作参数
    private actionRequestData = {
        name: '',
        id_type: '0',
        id_card: ''
    };
    ActionData = {} as any;
    

    async addWhite() {
        
        if(!this.checkInput() || !confirm('确认添加白名单?')) return false; 

        const res = await this.$ajax.requestApi<any, any>(this.actionRequestData, {
            url: '/api/tool/addZJWhite'
        });
        console.log(res);
        this.refreshActionLog();

        if(res && res.ret == 0 && res.data && res.data.ret_code == 0) {
            alert('添加白名单成功');
        }
        else {
            alert('添加失败:' + (res.msg || res.data.ret_msg ));
        }

    }

    async deleteWhite() {
        
        if(!this.checkInput() || !confirm('确认删除白名单?')) return false; 

        const res = await this.$ajax.requestApi<any, any>(this.actionRequestData, {
            url: '/api/tool/deleteZJWhite'
        });
        console.log(res);

        if(res && res.ret == 0 && res.data && res.data.ret_code == 0) {
            this.refreshActionLog();
            alert('删除白名单成功');
        }
        else {
            alert('删除失败:' + (res.msg || res.data.ret_msg ));
        }

    }
    async queryWhite() {
        if(!this.checkInput()) {
            this.refreshActionLog();            
            return false;
        }
       
        const res = await this.$ajax.requestApi<any, any>(this.actionRequestData, {
            url: '/api/tool/queryZJWhite'
        });
        console.log(res);

        this.refreshActionLog();

        if(res && res.ret == 0 && res.data) {
            let msg = res.data.ret_msg;
            if(res.data.ret_code == 0) {
                msg = res.data.query_state || '客户在白名单内';
            }
            else if(res.data.ret_code == 609999) {
                msg = '客户不在白名单内';
            }
            alert('查询白名单成功:' + msg);
        }
        else {
            alert('查询失败:' + (res.msg || res.data.ret_msg ));
        }

    }

    // 刷新
    async refreshActionLog() {
        const res = await this.$ajax.requestApi<any, any>({
            meta: {
                page: 0,
                count : 1000
            },
            params: {
                type: 2,
                targetId: (this.actionRequestData.id_card || '').replace(/[\W\w]{13}/, '******')
            }
        }, {
            url: '/api/actionLog/query'
        });
        if(res.ret == 0) {
            this.ActionData = res.data.data;
        }
    }

    // 检查输入
    checkInput() {
        if(!this.actionRequestData.name) {
            alert('姓名不可为空');
            return false;
        }
        if(!this.actionRequestData.id_card) {
            alert('证件号码不可为空');
            return false;
        }
        // 格式
        if(this.actionRequestData.id_type == '0' && !/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(this.actionRequestData.id_card)) {
            alert('证件号码格式不正确');
            return false;
        }
        return true;  
    }

    getIdTypeName(t) {
        for(const a of this.idTypes) {
            if(a.value == t) {
                return a.label;
            }
        }
        return '';
    }

    renderDate(v) {
        const d = moment(v);
        return d.isValid()?d.format('YYYY-MM-DD HH:mm:ss'):v;
    }

    mounted () {
        this.refreshActionLog();
    }

}

import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import * as moment from 'moment';
import StaffUserName from '@jv/jv-account/app/web/component/controls/user';

import whiteData from './whiteData.vue';

@Component({
    components: {
        StaffUserName,
        whiteData
    }
})
export default class WhiteManagerPage extends Vue {
    
    private queryMeta = {
        count: 10,
        page: 1
    };
    private queryParam = {
        name: ''
    };
    private totalCount = 0;

    private whiteStatus = {0:'未审核',1:'已审核',2:'已失效'};

    private whiteData = [];
    private dialogEditConfigVisible = false;
    private editWhiteConfig = {
        id: 0,
        name: '',
        type: '1',
        expireTime: '2999-12-31 00:00:00'
    };
    // 名单管理
    private dialogEditDataVisible = false;
    private editDataConfig = {};
    
    async queryWhite() {
        
        const res = await this.$ajax.requestApi<any, any>({
            meta: this.queryMeta,
            params: this.queryParam
        }, {
            url: '/api/whiteConfig/queryConfig'
        });
        console.log(res);

        if(res && res.ret == 0 && res.data) {
            this.whiteData = res.data.data;
            this.totalCount = Number(res.data.totalCount);
        }
        else {
            alert('查询失败:' + (res.msg));
        }

    }
    // 设置状态
    async setStatus(id, status, msg) {
        if(!confirm('确认' + msg + '?')) return false;
        const res = await this.$ajax.requestApi<any, any>({
            id,
            status
        }, {
            url: '/api/whiteConfig/setStatus'
        });
        console.log(res);

        if(res && res.ret == 0 && res.data.affectedRows > 0) {
            alert('操作成功');
            this.queryMeta.page = 1;// 回到第一页
            this.queryWhite();
        }
        else {
            alert('操作失败:' + (res.msg));
        }
    }
    // 保存
    async onSave() {
        const res = await this.$ajax.requestApi<any, any>(this.editWhiteConfig, {
            url: '/api/whiteConfig/save'
        });
        console.log(res);

        if(res && res.ret == 0 && res.data.affectedRows > 0) {
            this.dialogEditConfigVisible = false;
            //alert('保存成功');
            this.queryMeta.page = 1;// 回到第一页
            this.queryWhite();
        }
        else {
            alert('保存失败:' + (res.msg));
        }
    }

    // 编辑
    editConfig(data) {
        data = data || {};
        this.editWhiteConfig.id = data.Fwhite_list_id || 0;
        this.editWhiteConfig.name = data.Fname || '';
        this.editWhiteConfig.type = String(data.Ftype||1) || '1';
        this.editWhiteConfig.expireTime = data.Fexpire_time || '2999-12-31 00:00:00';
        
        this.dialogEditConfigVisible = true;
    }

    // 管理名单
    editData(data) {
        this.editDataConfig = data;
        this.dialogEditDataVisible = true;
    }


    renderDate(v) {
        const d = moment(v);
        return d.isValid()?d.format('YYYY-MM-DD HH:mm:ss'):v;
    }

    mounted () {
        this.queryWhite();
    }

}

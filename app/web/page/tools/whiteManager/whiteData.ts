import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import * as moment from 'moment';
import StaffUserName from '@jv/jv-account/app/web/component/controls/user';

@Component({
    components: {
        StaffUserName
    }
})
export default class WhiteDataPage extends Vue {
    @Prop()
    private editDataConfig: any;

    private queryMeta = {
        count: 5,
        page: 1
    };
    private queryParam = {
        loginId: '',
        whiteListId: 0
    };
    private dialogAddDataVisible = false;
    private editLogIds = '';
    private totalCount = 0;

    private whiteData = [];
    
    async queryWhite() {
        this.queryParam.whiteListId = this.editDataConfig.Fwhite_list_id;

        const res = await this.$ajax.requestApi<any, any>({
            meta: this.queryMeta,
            params: this.queryParam
        }, {
            url: '/api/whiteConfig/queryData'
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
    async setStatus(id, loginId, status, msg) {
        if(!confirm('确认' + msg + '?')) return false;
        const res = await this.$ajax.requestApi<any, any>({
            id,
            loginId,
            status
        }, {
            url: '/api/whiteConfig/setDataStatus'
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
    async addWhite() {
        const res = await this.$ajax.requestApi<any, any>({
            id: this.editDataConfig.Fwhite_list_id,
            loginIds: this.editLogIds,
        }, {
            url: '/api/whiteConfig/addWhite'
        });
        console.log(res);

        if(res && res.ret == 0 && res.data) {
            this.dialogAddDataVisible=false;
            this.queryMeta.page = 1;// 回到第一页
            this.queryWhite();
            alert('操作成功');
        }
        else {
            alert('操作失败:' + (res.msg));
        }
    }

    renderDate(v) {
        const d = moment(v);
        return d.isValid()?d.format('YYYY-MM-DD HH:mm:ss'):v;
    }

    mounted () {
        this.queryWhite();
    }

}

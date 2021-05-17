import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import * as moment from 'moment';
import StaffUserName from '@jv/jv-account/app/web/component/controls/user';

@Component({
    components: {
        StaffUserName
    }
})
export default class UserDataPage extends Vue {
    @Prop()
    private editDataConfig: any;

    private queryMeta = {
        count: 10,
        page: 1
    };
    private queryParam = {
        loginId: '',
    };
    private dialogAddDataVisible = false;
    private editLogIds = '';
    private totalCount = 0;

    private whiteData = [];
    
    async query() {

        const res = await this.$ajax.requestApi<any, any>({
            meta: this.queryMeta,
            params: this.queryParam
        }, {
            url: '/api/act/queryDiscountUserData'
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
            url: '/api/act/setDiscountUserStatus'
        });
        console.log(res);

        if(res && res.ret == 0 && res.data.affectedRows > 0) {
            this.queryMeta.page = 1;// 回到第一页
            this.query();
        }
        else {
            alert('操作失败:' + (res.msg));
        }
    }
    // 保存
    async addUser() {
        if(!confirm('确认添加用户名单吗？')) return false;
        if(!this.editLogIds) {
            alert('请输入用户loginID');
            return false;
        }
        const res = await this.$ajax.requestApi<any, any>({
            loginIds: this.editLogIds,
        }, {
            url: '/api/act/addDiscountUser'
        });
        console.log(res);

        if(res && res.ret == 0 && res.data) {
            this.dialogAddDataVisible=false;
            this.queryMeta.page = 1;// 回到第一页
            this.query();
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
        this.query();
    }

}

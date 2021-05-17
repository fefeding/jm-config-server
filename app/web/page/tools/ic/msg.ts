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
    private editLoginIds = '';
    private title = '';
    private picurl = 'https://wework.qpic.cn/wwpic/354847_dVeqZQf-T2-V9rZ_1617756921/0';
    private url = '';
    private desc = '';

    // 保存
    async sendMsg() {
        // 
        if(!this.picurl) {
            alert('参数错误');
            return false;
        }

        if(!confirm('客户的IC将会收到消息推送，IC确认后才会真实发送到客户，确定发送？')) return false;

        const res = await this.$ajax.requestApi<any, any>({
            companyId: 3,
            loginIds: this.editLoginIds,
            image: this.picurl
            
        }, {
            url: '/api/tool/sendMsgToCustomer'
        });
        console.log(res);

        if(res && res.ret == 0) {
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
        
    }

}

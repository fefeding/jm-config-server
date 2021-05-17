import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import * as moment from 'moment';
import StaffUserName from '@jv/jv-account/app/web/component/controls/user';

@Component({
    components: {
        StaffUserName
    }
})
export default class DiscountLogPage extends Vue {
    @Prop()
    private editDataConfig: any;

    private queryMeta = {
        count: 1000,
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
            url: '/api/act/queryDiscountUserDataLog'
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

    renderDate(v) {
        const d = moment(v);
        return d.isValid()?d.format('YYYY-MM-DD HH:mm:ss'):v;
    }

    mounted () {
        this.query();
    }

}

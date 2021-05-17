import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import * as moment from 'moment';
import { GetUserInfoRes } from '@jv/jv-models/config-system/tools';

@Component({
    filters: {
        uid(row): string {
            console.log(row)
            const item = row.cert || row.client;
            return item?.uid || '-';
        },
        loginId(row): string {
            const item = row.open || row.lct || row.wxpay;
            return item?.loginId || '-';
        },
        accountId(row): string {
            const item = row.open;
            return item?.accountId || '-';
        },
        clientId(row): string {
            const item = row.client;
            return item?.clientId || '-';
        }
    }
})
export default class SourceDataEditUI extends Vue {
    userData: any = [];

    searchForm =  {
        accountId: '',
        uid: '',
        loginId: '',
        telNo: '',
        idNo: ''
    };

    get uid(): string {
        if (!this.userData || this.userData.length === 0) {
            return '';
        }

        return '';
    }

    async searchData() {
        const res = await this.$ajax.requestApi<any, any>(this.searchForm, {
            url: '/api/tool/queryLctBind'
        });

        this.userData = res.data ? [res.data] : [];
    }

    mounted () {

    }

}

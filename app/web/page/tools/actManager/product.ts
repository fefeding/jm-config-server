import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import * as moment from 'moment';
import StaffUserName from '@jv/jv-account/app/web/component/controls/user';

@Component({
    components: {
        StaffUserName,
    }
})
export default class ProductPage extends Vue {
    
    private queryMeta = {
        count: 10,
        page: 1
    };
    private queryParam = {
        name: '',
        id: ''
    };
    private totalCount = 0;

    private productData = [];
    private dialogEditProductVisible = false;
    private editProductData = {
        id: 0,
        name: '',
        rate: 0.1
    };
    
    async query() {
        
        const res = await this.$ajax.requestApi<any, any>({
            meta: this.queryMeta,
            params: this.queryParam
        }, {
            url: '/api/act/queryDiscountProduct'
        });
        console.log(res);

        if(res && res.ret == 0 && res.data) {
            this.productData = res.data.data;
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
            url: '/api/act/setDiscountProductStatus'
        });
        console.log(res);

        if(res && res.ret == 0 && res.data.affectedRows > 0) {
            alert('操作成功');
            this.queryMeta.page = 1;// 回到第一页
            this.query();
        }
        else {
            alert('操作失败:' + (res.msg));
        }
    }
    // 保存
    async onSave() {
        if(!this.editProductData.id) {
            alert('产品ID不可为空');
            return false;
        }
        if(!confirm('确认修改产品折扣信息？')) return false;
        const res = await this.$ajax.requestApi<any, any>(this.editProductData, {
            url: '/api/act/saveDiscountProduct'
        });
        console.log(res);

        if(res && res.ret == 0 && res.data.affectedRows > 0) {
            this.dialogEditProductVisible = false;
            //alert('保存成功');
            this.queryMeta.page = 1;// 回到第一页
            this.query();
        }
        else {
            alert('保存失败:' + (res.msg));
        }
    }

    // 编辑
    editProduct(data) {
        data = data || {};
        this.editProductData.id = data.Fproduct_id || ''; 
        this.editProductData.name = data.Fproduct_brief_name || '';
        this.editProductData.rate = Number(data.Fdiscount_rate) || 0;
        
        this.dialogEditProductVisible = true;
    }


    renderDate(v) {
        const d = moment(v);
        return d.isValid()?d.format('YYYY-MM-DD HH:mm:ss'):v;
    }

    mounted () {
        this.query();
    }

}

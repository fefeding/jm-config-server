'use strict';
import { Vue, Component, Watch } from 'vue-property-decorator';
import * as moment from 'moment';
import { SearchPublishLogReq, SearchPublishLogRsp, PublishLog, PublishLogState } from '@jv/jv-models/config-system/publishLog';

import StaffUserName from '@jv/jv-account/app/web/component/controls/user';

@Component({
    components: {
        StaffUserName
    }
})
export default class PublishHistoryUI extends Vue {

    currentPage = 1;
    pageSize = 20;
    totalCount = 0;
    logDetailDialogVisible = false;
    currentLog = new PublishLog();
    logs = new Array<PublishLog>();

    async mounted(): Promise<void> {
        this.search();
    }

    // 查询
    @Watch('$route')
    async search(): Promise<void> {
        const sourceId = this.$route.params.id || 0;

        const req = new SearchPublishLogReq();
        req.page = this.currentPage;
        req.size = this.pageSize;
        req.sourceId = sourceId;

        const loading = this.$loading({
            lock: true,
            text: '查询中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });
        const rsp = await this.$ajax.requestApi<SearchPublishLogReq, SearchPublishLogRsp>(req, {
            method: 'get'
        });

        if(rsp.ret == 0) {

            // 刷新
            this.logs = rsp.data;
            this.totalCount = rsp.total;
        }
        else {
            this.$message.error('查询失败：' + rsp.msg);
        }

        loading.close();
    }

    pageChange() {
        this.search();
    }

    // 显示状态
    renderStateCell(row) {
        switch(row.state) {
            case PublishLogState.success: {
                return '成功';
            }
            case PublishLogState.failed: {
                return '失败';
            }
        }
        return '未知';
    }

    renderDateCell(date, format='YYYY-MM-DD HH:mm:ss') {
        return moment(date).format(format);
    }

    showLogDetail(row) {
        this.currentLog = row;
        this.logDetailDialogVisible = true;
    }
}

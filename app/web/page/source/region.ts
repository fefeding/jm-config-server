import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Route } from 'vue-router';

import {
    QuerySourceRegionsReq,
    QuerySourceRegionRsp,
    SourceRegionSaveReq,
    SourceRegionSaveRsp,
    QueryRegionTreeReq,
    QueryRegionTreeRsp,
    DeleteSourceRegionReq,
    DeleteSourceRegionRsp,
    SourceRegion
 } from '../../../model/interface/sourceRegion';

@Component({
    components: {
    }
})
export default class RegionEditUI extends Vue {

    currentSourceRegion: SourceRegion = new SourceRegion(); // 当前目录
    parentId = '0'; // 当前目录的父级ID，在创建目录时用到, 0表示在根目录
    parentOptions = new Array<{
        label: string,
        value: string,
        children: any
    }>();

    @Watch('$route')
    async loadRegion(router?: Route) {
        router = router || this.$route;
        const id = router.params? router.params.id : 0;
        this.parentId = (Number(router.params? router.params.parentId : 0) || 0).toString();
        if(id > 0) {
            this.currentSourceRegion = await this.loadRegionById(id);
        }
        else {
            this.currentSourceRegion = new SourceRegion();
            this.currentSourceRegion.parentId = Number(this.parentId);
        }
    }

    // 初始化数据
    async created() {
        await this.loadRegions();// 先加载所有目录
    }

    async mounted () {
        const loading = this.$loading({
            lock: true,
            text: '加载中...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });

        await this.loadRegion();

        loading.close();
    }

    // 加载单个目录
    async loadRegionById(id): Promise<SourceRegion> {
        const req = new QuerySourceRegionsReq();
        req.id = id;
        const rsp = await this.$ajax.requestApi<QuerySourceRegionsReq, QuerySourceRegionRsp>(req, {
            method: 'GET'
        });
        // @ts-ignore
        return rsp.data && rsp.data.length?rsp.data[0]: rsp.data;
    }

    // 加载所有目录
    async loadRegions(): Promise<SourceRegion> {
        const req = new QueryRegionTreeReq();
        req.containSource = false;
        const rsp = await this.$ajax.requestApi<QueryRegionTreeReq, QueryRegionTreeRsp>(req, {
            method: 'GET'
        });

        if(Array.isArray(rsp.data)) {
            for(let m of rsp.data) {
                this.parentOptions.push(
                    this.convertToOption(m)
                );
            }
        }
        else {
            this.parentOptions.push(
                this.convertToOption(rsp.data)
            );
        }
        return rsp.data;
    }

    // 目录转为级联选择器
    convertToOption(region: SourceRegion) {
        const opt = {
            label: region.name,
            value: region.id.toString(),
            children: new Array<any>()
        };
        if(region.children && region.children.length) {
            for(let r of region.children) {
                opt.children.push(
                    this.convertToOption(r)
                );
            }
        }
        else {
            // @ts-ignore
            delete opt.children;
        }
        return opt;
    }

    // 只存当前目录
    async save() {
        if(!this.currentSourceRegion.name) {
            this.$message.error('目录名称不能为空');
            return false;
        }
        const req = new SourceRegionSaveReq();
        req.data = this.currentSourceRegion;

        const loading = this.$loading({
            lock: true,
            text: '保存中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });
        const rsp = await this.$ajax.requestApi<SourceRegionSaveReq, SourceRegionSaveRsp>(req);
        // 保存成功
        if(rsp.ret == 0) {
            this.$message('保存成功');
            // e 有ID为修改
            if(this.currentSourceRegion.id > 0) this.currentSourceRegion.name = rsp.data.name;
            else {
                this.currentSourceRegion.id = rsp.data.id;
            }
        }
        else {
            this.$message(rsp.msg || '保存失败');
        }
        loading.close();
    }

    // 创建目录
    // flag=0创建同级， =2 创建子目录
    createRegion(flag) {
        const pid = flag === 0? this.parentId: this.currentSourceRegion.id; // 同级就用当前的目录父ID，子级就用当前ID
        this.$router.push(`/region/${pid}/0`);
    }

    // 创建数据源
    createSourceData() {
        this.$router.push(`/source/${this.currentSourceRegion.id}/0`);
    }

    // 删除数据源
    async deleteRegion() {
        if((!this.currentSourceRegion || this.currentSourceRegion.id <= 0) ||
            await this.$confirm("确认删除？", '') != 'confirm') return;

        const req = new DeleteSourceRegionReq();
        req.id = this.currentSourceRegion.id;

        const loading = this.$loading({
            lock: true,
            text: '删除中...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });

        const rsp = await this.$ajax.requestApi<DeleteSourceRegionReq, DeleteSourceRegionRsp>(req);
        // 保存成功
        if(rsp.ret == 0) {
            this.$message('删除成功');
            setTimeout(()=>{
                location.replace('../../');// 刷新
            }, 1000);
        }
        else {
            this.$message(rsp.msg || '删除失败');
        }
        loading.close();
    }
}

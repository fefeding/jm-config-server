'use strict';
import { Vue, Component, Prop } from 'vue-property-decorator';
import SourceEdit from './edit.vue';
import SourceDataEdit from './data.vue';
import { GetSourceByRegionReq, GetSourceByRegionRsp, Source } from '../../../model/interface/sourceData';
import { QueryRegionTreeReq, QueryRegionTreeRsp, SourceRegionSaveReq, SourceRegionSaveRsp, SourceRegion } from '../../../model/interface/sourceRegion';


@Component({
    components: {
        SourceEdit,
        SourceDataEdit
    }
})
export default class SourceUI extends Vue {
    /**
     * 树节点映射
     */
    treeProps = {
        label: 'name',
        children: 'children',
        isLeaf: 'isLeaf'
    }
    /**
     * 目录结构
     */
    treeRegions = new Array<SourceRegion>();
    //控制目录新增修改弹窗
    regionDialogVisible = false;
    regionDialogTitle = '新增目录';
    sourceDialogTitle = '新增数据源';
    sourceDialogVisible = false;

    opertionRegion; // 当前操作目录，在新增子目录时，记录父级
    editRegionName = '';
    editRegion: SourceRegion = new SourceRegion();
    // 当前选择节点
    currentRegion: SourceRegion = new SourceRegion();
    currentRegionNode;
    // 当前编辑的资源id
    currentEditSource: Source = new Source();
    // 当前选择的数据源id
    currentSelectSource = new Source();

    // 当前操作的目录ID
    currentRegionId = 0;

    async mounted(): Promise<void> {

        this.loadRegions();
    }

    // 加载所有目录
    async loadRegions(): Promise<void> {
        const req = new QueryRegionTreeReq();

        const rsp = await this.$ajax.requestApi<QueryRegionTreeReq, QueryRegionTreeRsp>(req, {
            method: 'GET'
        });

        // 默认后台会返回一个根结点
        const root = this.initRegionNodes(rsp.data);

        this.treeRegions = [ root ];
        //this.$store.commit('setMenus', this.treeRegions);
    }
    // 初始化树节点数据
    initRegionNodes(region): any {

        const node = {
            name: region.name,
            id: region.id,
            children: new Array<any>(),
            region: region,
            isLoading: false,
            hasChildRegion: false
        }

        for(let r of region.children) {
            node.children.push(
                this.initRegionNodes(r)
            )
            node.hasChildRegion = true;
        }
        return node;
    }

    /**
     * 获取目录下所有数据源
     * @param regionId 目录ID
     */
    async loadSourceByRegion(region, node) {
        const req = new GetSourceByRegionReq();
        req.regionId = region.id;

        region.isLoading = true;

        const rsp = await this.$ajax.requestApi<GetSourceByRegionReq, GetSourceByRegionRsp>(req, {
            method: 'GET'
        });

        const children = new Array<{
            name: string,
            id: string,
            isSource: boolean,
            source: Source,
            children: []
        }>();
        for(let s of rsp.data) {
            children.push({
                name: `${s.description||''}【${s.key||''}】`,
                id: s.key,
                isSource: true,
                source: s,
                children: []
            });
        }
        region.children = children;
        region.hasSource = true;
        region.isLoading = false;
        node.expand();// 展开
    }


    /**
     * 加载指定目录下的数据源
     * @param node 当前目录
     */
    async regionSelected(data, node) {
        console.log(data);

        this.currentRegion = data;
        this.currentRegionNode = node;

        // 叶子加载目录下的数据源
        if(data.region && !data.children.length) {
            await this.loadSourceByRegion(data, node);
        }
        else if(data.source) {
            this.currentSelectSource = data.source;
        }
    }
    // 目录右侧添加菜单事件
    addHandleCommand(command, data) {
        console.log(command, data);
        if(command === 'region') {
            if(data.hasSource) {
                alert('已存在数据源的目录无法添加子目录');
                return false;
            }
            this.regionDialogTitle = '新增目录';
            this.regionDialogVisible = true;
            this.editRegion.id = 0;
            this.editRegion.parentId = data.id;
            this.editRegionName = '';
            this.opertionRegion = data;
        }
        else if(command == 'updateregion') {
            if(data.id == 0) {
                alert('根目录无法修改');
                return false;
            }
            this.regionDialogTitle = '修改目录';
            this.regionDialogVisible = true;
            this.editRegion.id = data.id;
            this.editRegionName = data.name;
            this.opertionRegion = data;
        }
        // 新增数据源
        else if(command == 'source') {
            this.currentRegionId = data.id;
            this.currentEditSource.fromJSON({
                id: 0,
                key: '',
                meta: { }
            });
            this.sourceDialogTitle = '新增数据源';
            this.sourceDialogVisible = true;
        }
        return false;
    }

    // 创建目录
    async saveRegion() {
        const req = new SourceRegionSaveReq();
        this.editRegion.name = this.editRegionName;
        req.data = this.editRegion;

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
            if(this.editRegion.id > 0) this.opertionRegion.name = rsp.data.name;
            else {
                const region = this.initRegionNodes(rsp.data);
                this.opertionRegion.children.push(region);
                this.opertionRegion.hasChildRegion = true; //新增子目录后，它就有不能再新增子数据源了
            }
            this.regionDialogVisible = false;

            // 刷新当前目录数据
            //await this.loadSourceByRegion(this.currentRegionNode, this.currentRegionNode);
            loading.close();
        }
        else {
            this.$message(rsp.msg || '保存失败');
        }
    }
    // 编辑目录或数据源事件
    editRegionORSource(data) {
        if(data.region) {
            this.addHandleCommand('updateregion', data);
            return false;
        }
        // 编辑数据源
        else if(data.source) {
            this.currentEditSource.fromJSON(data.source);
            this.currentRegionId = data.source.regionId;
            this.sourceDialogTitle = '修改数据源';
            this.sourceDialogVisible = true;
        }
    }
}

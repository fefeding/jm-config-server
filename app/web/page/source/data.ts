import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import * as moment from 'moment';

import VJsoneditor from 'v-jsoneditor';

import ImageUploadControl from '../../component/controls/imageUpload.vue';
import MapData from '../../component/controls/mapData.vue';
import {
    GetSourceByIdReq, GetSourceByIdRsp,
    SaveSourceDataReq, SaveSourceDataRsp,
    DeleteSourceDataReq, DeleteSourceDataRsp,
    DeleteSourceReq, DeleteSourceRsp,
    PublishSourceReq, PublishSourceRsp,
    Source, Meta, Field, FieldType, FieldSearchType,
    FieldDataChannel, SourceData, DataStruct } from '../../../model/interface/sourceData';


@Component({
    components: {
        ImageUploadControl,
        MapData,
        VJsoneditor
    }
})
export default class SourceDataEditUI extends Vue {

    // 当前编辑的数据源ID
    //@Prop()
    public source: Source | undefined;

    private hasSearch = false; // 是否有查询
    private searchFields = new Array<{
        field: Field,
        value: string
    }>();

    private locationDomain = location.hostname;

    private remoteSource = new Source();
    private sourceFields = new Array<Field>();
    // 所有当前数据
    private sourceData = new Array<any>();
    private filterResultData = new Array<any>();
    private currentPage = 1; // 当前页码
    private currentPageSize = 10;// 当前每页显示条数
    private currentTotalCount = 1; // 当前总数据条数

    private dataEditDialogTitle: string = '新增数据';
    private dataEditDialogVisible = false;
    // 当前正在编辑的数据源
    private curretSourceDataRow;
    private currentEditDataRow: SourceData = new SourceData();
    private currentEditDataRowData = new DataStruct();
    // 默认排序
    // 数据会根据当前配置进行排序
    private currentSortFields = [
        {
            prop: 'modifyTime',
            order: 'descending'
        }
    ];

    private isPublishing: boolean = false;// 发布中

    // 侦听sourceid变化
    get computedSource() {
        if(this.source && this.source.id > 0 && (!this.remoteSource || this.remoteSource.id != this.source.id)) {
            console.log(' data edit ' , this.source);
            this.bindSourceData(this.source.id);// 去加载数据源数据
        }
        return this.source || this.remoteSource;
    }

    @Watch('$route')
    @Watch('source')
    getSource(newRoute) {
        newRoute = newRoute || this.$route;
        // 如果通过router传参
        var sourceId = Number(newRoute.params?newRoute.params.id:0) || 0;
        if(!sourceId && this.source) sourceId = this.source.id;
        if(sourceId && (!this.remoteSource || this.remoteSource.id != sourceId)) {
            this.bindSourceData(sourceId);
        }
    }

    mounted () {
        this.getSource(this.$route);
    }

    // 绑定当前数据源数据
    async bindSourceData(id) {
        const data = await this.loadSource(id);
        for(let d of data.data) {
            if(!d.row) d.row = new DataStruct();
        }

        this.initEditDataRow(true, data.meta.Fields);
        this.isPublishing = false;
        this.remoteSource = data;
        // 组装所有数据
        this.sourceData = data.data;
        this.sourceFields = data.meta.Fields;
        // 搜索相关
        this.searchFields = new Array<{
            field: Field,
            value: string
        }>();
        this.hasSearch = false;

        // 需要初始化关连的数据选项
        for(let f of this.sourceFields) {
            if(f.searchType && f.searchType > 0) {
                this.hasSearch = true;
                this.searchFields.push({
                    field: f,
                    value: ''
                });
            }

            // 只有关连数据源的才需要处理
            if(!f.data || !f.data['sourceId']) continue;
            if(f.type == 'single' || f.type == 'mutiple') {
                const filters = new Array<{
                    text: string,
                    value: string
                }>();
                // 如果是关联的其它数据源
                if(f.dataChannel === 'source') {
                    const optionData = await this.loadSource(f.data['sourceId']);
                    const labelfield = f.data['label'];
                    const valeufield = f.data['value'];
                    const optionArray = new Array<{label: string, value: string}>();
                    for(let v of optionData.data) {
                        optionArray.push({
                            label: v.row[labelfield] + '',
                            value: v.row[valeufield] + ''
                        });
                        filters.push({
                            text: v.row[labelfield] + '',
                            value: v.row[valeufield] + ''
                        });
                    }
                    f.data = optionArray;
                }
                else if(Array.isArray(f.data)) {
                    for(let v of f.data) {
                        filters.push({
                            text: v.label,
                            value: v.value
                        });
                    }
                }
                // @ts-ignore
                f.filters = filters;
            }
        }
        // 如果是router跳转，则不会有source，赋值，这时remoteSource == this.source，就不会触重新load
        this.source = data;

        this.filterData();// 分页和过滤数据
    }

    // 加载指定的资源信息
    async loadSource(id): Promise<Source> {
        const req = new GetSourceByIdReq();
        req.id = id;
        const rsp = await this.$ajax.requestApi<GetSourceByIdReq,GetSourceByIdRsp>(req, {
            method: 'GET'
        });
        if(rsp.ret == 0) {

            if(!rsp.data.meta) {
                rsp.data.meta = new Meta();// 数据源结构
            }
            if(!rsp.data.meta.Fields) {
                rsp.data.meta.Fields = new Array<Field>();
            }
            for(let f of rsp.data.meta.Fields) {
                f.isUnique = !!f.isUnique;
                f.isRequired = !!f.isRequired;
                f.isHide = !!f.isHide;
            }

            return rsp.data;
        }
        else {
            this.$alert(rsp.msg || '获取数据配置失败', '获取数据源失败', {
                confirmButtonText: '确定',
                callback: action => {

                }
              });
            return new Source();
        }
    }

    // 渲染单元格数据
    renderCell(v, c) {
        switch(c.type) {
            case 'image': {
                return '<a href="'+(v||'')+'" target="_blank"><img src="'+(v||'')+'" style="max-width: 30px;max-height:30px;" /></a>';
            }
            case 'file': {
                return '<a href="'+(v||'')+'" target="_blank">'+(v||'')+'</a>';
            }
            case 'single': {
                if(!c.data) return v;
                for(let d of c.data) {
                    if(d.value == v) return v + ' ' + d.label;
                }
                break;
            }
            case 'mutiple': {
                let ret = '';
                if(!v || !c.data) return v;
                for(let m of v) {
                    for(let d of c.data) {
                        if(d.value == m) ret += d.label + ', ';
                    }
                }
                return ret || v;
            }
            case 'datetime': {
                const d = moment(v);
                return d.isValid()?d.format('YYYY-MM-DD HH:mm:ss'):v;
            }
        }
        return v || '';
    }

    // 根据列初始化数据修改窗
    initEditDataRow(reset?: boolean, fields?, dataRow?: DataStruct) {
        if(!this.source) return;
        // 只有在第一次时需要初始化
        if(!this.currentEditDataRow || this.currentEditDataRow.sourceId != this.source.id) {
            this.currentEditDataRow = new SourceData();
            this.currentEditDataRow.sourceId = this.source.id;
            reset = true;
        }
        var row = new DataStruct();
        if(reset) {
            this.currentEditDataRow.id = 0;
            if(this.source) this.currentEditDataRow.sourceId = this.source.id;
        }
         // 初始化行里的数据列
         fields = fields ||this.sourceFields;
         if(!fields) return;
         for(let f of fields) {
             if(dataRow && dataRow[f.name]) {
                row[f.name] = typeof dataRow[f.name] === 'undefined'?f.default:dataRow[f.name];
             }
             // 不存在或指定了要重置，则初始化
            else if(reset || typeof row[f.name] == 'undefined') {
                switch(f.type) {
                    case FieldType.json:
                    case FieldType.map: {
                        try{
                            if(f.default) {
                                row[f.name] = JSON.parse(f.default);
                                break;
                            }
                        }
                        catch(e) {
                            console.log(e);
                        }
                        row[f.name] = {};
                        break;
                    }
                    case FieldType.number: {
                        row[f.name] = f.default || 0;
                        break;
                    }
                    // 单选
                    case FieldType.single: {
                        row[f.name] = f.default || '';
                        break;
                    }
                    // 多选
                    case FieldType.mutiple: {
                        row[f.name] = new Array<DataStruct>();
                        break;
                    }
                    // 随机码就生成一个
                    case FieldType.random: {
                        row[f.name] = new Date().getTime() + '#' + Math.ceil(Math.random() * 100000);
                        break;
                    }
                    default: {
                        row[f.name] = f.default || '';
                    }
                }
            }
        }
        this.currentEditDataRowData = row;
    }

    // 查询数据
    filterData() {

        var matchCount = 0;// 总匹配上的条数
        this.currentTotalCount = 0;// 完全符合筛选条件的条数

        const dataStart = this.currentPageSize * (this.currentPage - 1);// 当前页码的起始数据
        // 先根据排序字段排序
        this.filterResultData = this.sourceData.sort((s1, s2) => {
            for(let s of this.currentSortFields) {
                if(!s.prop || !s.order) continue;
                const v1 = s.prop == 'modifyTime'? s1.modifyTime: s1.row[s.prop];
                const v2 = s.prop == 'modifyTime'? s2.modifyTime: s2.row[s.prop];

                if(v1 == v2) continue; // 如果值一样，则继续走其它排序

                // 如果是逆序
                if(s.order === 'descending') {
                    return s1.modifyTime > s2.modifyTime? -1: 1;
                }
                else {
                    return s1.modifyTime < s2.modifyTime? -1: 1;
                }
            }
            return 0;

        }).filter((v, i) => {
            // 如果有筛选条件，则处理命中
            for(let f of this.searchFields) {
                if(f.value === '' || (Array.isArray(f.value) && !f.value.length) || !f.field) continue;
                const cv = Array.isArray(v.row[f.field.name])? v.row[f.field.name]: [v.row[f.field.name]];
                const fv = Array.isArray(f.value)?f.value:[f.value];

                // 多选时，只需要一个匹配上就可以
                var match = false;
                for(let fvm of fv) {
                    // 如果是数组，只要其中一个值命中即可
                    for(let cvm of cv) {
                        if(!cvm && cvm != '0') continue;
                        if(typeof cvm !== 'string') cvm = cvm.toString();

                        switch(f.field.searchType) {
                            // ==
                            case FieldSearchType.equal: {
                                if(cvm == fvm) match = true;
                                break;
                            }
                            case FieldSearchType.rightMatch: {
                                if(cvm && cvm.startsWith(fvm)) match = true;
                                break;
                            }
                            case FieldSearchType.leftMatch: {
                                if(cvm && cvm.endsWith(fvm)) match = true;
                                break;
                            }
                            case FieldSearchType.allMatch: {
                                if(cvm && cvm.includes(fvm)) match = true;
                                break;
                            }
                        }
                    }
                }
                if(!match) {
                    return false;
                }
            }

            this.currentTotalCount ++;// 只要符合条件就给总计数加1

            // 如果当前筛选出的数据还没达到一页，则继续加进数据原
            if(this.currentTotalCount > dataStart && matchCount < this.currentPageSize) {
                matchCount ++; // 当前页已筛选到的数据
                return true;
            }
            // 超出一页的，只做计数，不展示
            return false;
        });

    }
    // 排序发生改变 col, prop, order
    dataSortChange(opt) {
        console.log(opt);
        // 把排序规则加入列表， 最近的规则优先级最高
        for(let i=this.currentSortFields.length-1; i>=0; i--) {
            if(this.currentSortFields[i].prop == opt.prop) {
                this.currentSortFields.splice(i, 1);
                break;
            }
        }
        // 有排序
        opt.order && this.currentSortFields.unshift(opt); // 参与排序

        this.currentPage = 1;// 排序改变跳到第一页
        // 刷新数据
        this.filterData();
    }

    // 每页显示多少条改变事件
    onPageSizeChange(size) {
        this.currentPageSize = size;
        this.filterData();
    }
    // 当前页码改变事件
    onPageCurrentPageChange(page) {
        this.currentPage = page || 1;
        this.filterData();
    }

    // 弹出编辑数据行
    editData(row?: SourceData) {

        if(row) {
            this.dataEditDialogTitle = '修改数据';
            this.initEditDataRow(true, this.sourceFields, row.row);// 重置数据值
            this.currentEditDataRow.sourceId = row.sourceId;
            this.currentEditDataRow.id = row.id;
            //this.currentEditDataRowData = row.row;
            this.curretSourceDataRow = row;
        }
        else if(this.source) {
            this.dataEditDialogTitle = '新增数据';
            this.initEditDataRow(true); // 重置数据值
        }
        this.dataEditDialogVisible = true;
    }

    // 保存当前数据
    async saveData() {
        if(!this.currentEditDataRow) return false;
        this.currentEditDataRow.row = this.currentEditDataRowData;
        console.log(this.currentEditDataRow);
        for(let f of this.sourceFields) {
            if(f.isRequired && !this.currentEditDataRow.row[f.name] && this.currentEditDataRow.row[f.name] !== 0) {
                this.$message.error(`${f.nickName}不可为空`);
                return false;
            }
        }
        const req = new SaveSourceDataReq();
        req.data = this.currentEditDataRow;

        const loading = this.$loading({
            lock: true,
            text: '保存中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });
        const rsp = await this.$ajax.requestApi<SaveSourceDataReq, SaveSourceDataRsp>(req);

        if(rsp.ret == 0) {
            this.$message.success('保存成功');
            this.dataEditDialogVisible = false;
            if(this.curretSourceDataRow && this.currentEditDataRow.id > 0) {
                Object.assign(this.curretSourceDataRow.row, this.currentEditDataRowData);
            }
            else {
                // 新增的行
                this.sourceData.push(rsp.data);
            }

            this.filterData();// 刷新数据
        }
        else {
            this.$message.error('保存失败:' + rsp.msg);
        }

        loading.close();
    }

    // 删除数 据
    async deleteData(data) {
        if(await this.$confirm("确认删除？", '') != 'confirm') return;

        const req = new DeleteSourceDataReq();
        req.id = data.id;

        const loading = this.$loading({
            lock: true,
            text: '删除中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });
        const rsp = await this.$ajax.requestApi<DeleteSourceDataReq, DeleteSourceDataRsp>(req);

        if(rsp.ret == 0) {
            this.$message.success('删除成功');
            // 刷新
            this.remoteSource && this.bindSourceData(this.remoteSource.id);
        }
        else {
            this.$message.error('删除失败');
        }

        loading.close();
    }

    // 发布数据
    async publish(row) {

        if(this.remoteSource?.id <= 0) return;

        // 全量发布
        if(!row && await this.$confirm("这里的发布会全量同步，确认发布？", '全量发布') != 'confirm') return;

        // 发布单条
        if(row && await this.$confirm("当前发布单条记录，确认发布？", '单条发布') != 'confirm') return;

        const req = new PublishSourceReq();
        // @ts-ignore
        req.id = this.source.id;
        req.dataId = row?row.id:0;

        this.isPublishing = true;
        const loading = this.$loading({
            lock: true,
            text: '发布中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });
        const rsp = await this.$ajax.requestApi<PublishSourceReq, PublishSourceRsp>(req);

        if(rsp.ret == 0) {
            this.$message.success('发布成功');
        }
        else {
            this.$message.error('发布失败:' + rsp.msg);
        }

        loading.close();
        this.isPublishing = false;
    }

    // 跳去编辑数据源
    editSource() {
        this.$router.push(`/source/${this.remoteSource.regionId}/${this.remoteSource.id}`);
    }

    // 删除数据源
    async deleteSource() {
        if((!this.remoteSource || this.remoteSource.id <= 0) ||
            await this.$confirm("确认删除？", '') != 'confirm') return;

        const req = new DeleteSourceReq();
        req.id = this.remoteSource.id;

        const loading = this.$loading({
            lock: true,
            text: '删除中...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
        });

        const rsp = await this.$ajax.requestApi<DeleteSourceReq, DeleteSourceRsp>(req);
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

    // 选择器过滤数据, key和名称都可以过滤
    filterSelecterData(code, field, data) {
        
        // 缓存原始数据队列，通过过滤会改变data字段。
        const values = field['_$_data'] = field['_$_data'] || field.data;
        const result = new Array<any>();

        for(let v of values) {
            // 去重
            if(result.findIndex(p => p.value == v.value) > -1) continue;
            
            const label = v.label + '';
            var value = v.value + '';

            if(label && label.includes(code)) {
                result.push(v);
            }
            else if(value && value.includes(code)) {
                result.push(v);
            }
        }

        console.log(result);
        field.data = result;
    }
}

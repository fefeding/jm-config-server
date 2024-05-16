import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Route } from 'vue-router';
import 'codemirror/lib/codemirror.css';
// import language js
import 'codemirror/mode/javascript/javascript.js'
import { codemirror } from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';

import VJsoneditor from 'v-jsoneditor';

import * as packageFormat from 'prettier-package-json';

import {
    GetSourceByIdReq, GetSourceByIdRsp,
    GetAllSourceReq, GetAllSourceRsp,
    SaveSourceReq, SaveSourceRsp, Source, Meta, Field, FieldType, FieldDataChannel } from '../../../model/interface/sourceData';

@Component({
    components: {
        VJsoneditor,
        codemirror
    }
})
export default class SourceEditUI extends Vue {

    // 当前编辑的对象
    public sourceId: number|undefined = 0;
    public regionId: number|undefined = 0;

    // json高亮
    codeJSONOptions = {
        tabSize: 4,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: {
            name: 'javascript',
            json: true
        },
        lineWrapping: true,
        theme: 'base16-dark'
      };

    defaultScript = '';

    // 当前编辑对象
    private currentSource = new Source();
    fieldDialogVisible = false;// 弹出字段编辑
    fieldDialogTitle = '新增字段'; // 字段编辑标题
    // 当前编辑字段
    currentField = new Field();
    currentFieldFlag = 0; // 0=新增字段，1=修改字段
    currentFieldDataString;
    // 数据来源如果是其它数据源，则采用当前配置
    currentFieldDataSource = {
        sourceId: 0, // 数据源id
        label: '', // 显示字段
        value: ''   // 关健值字段
    };
    currentPublishScript = this.defaultScript;// 当前发布脚本
    publishScriptDialogVisible = false;

    fieldTypeMap = [
        {
            label: '单行文本',
            value: 'text'
        },
        {
            label: '多行文本',
            value: 'content'
        },
        {
            label: '随机码',
            value: 'random'
        },
        {
            label: '数字',
            value: 'number'
        },
        {
            label: '时间',
            value: 'datetime'
        },
        {
            label: '单选',
            value: 'single'
        },
        {
            label: '多选',
            value: 'mutiple'
        },
        {
            label: '图片',
            value: 'image'
        },
        {
            label: '文件',
            value: 'file'
        },
        {
            label: 'json',
            value: 'json'
        },
        {
            label: '健值对',
            value: 'map'
        },
    ];
    // 所有资源选择
    allSourceOptions = new Array<{
        label: string,
        value: number,
        key: string,
        source: Source
    }>();
    currentSourceOptions = new Array<{
        label: string,
        value: number,
        key: string,
        source: Source
    }>();


    // 侦听sourceid变化
    get computedSourceId() {
        return this.sourceId;
    }
    // 当前数据结构
    get computedMeta() {
        if(this.currentSource.meta && this.currentSource.meta.Fields) {
            this.currentSource.meta.Fields.sort((f1, f2) => {
                return f1.sort - f2.sort;
            });
        }
        return this.currentSource.meta;
    }
    set computedMeta(v) {
        this.currentSource.meta = v;
    }
    // 当前选择的数据源的字段
    get computedCurrentSourceFields() {
        // 从当前选择的数据源返回字段
        for(let s of this.allSourceOptions) {
            if(s.value == this.currentFieldDataSource.sourceId) {
                return s.source.meta?s.source.meta.Fields:[];
            }
        }
        return [];
    }

    @Watch('$route')
    async sourceChange(router?: Route) {
        router = router || this.$route;
        this.sourceId = Number(router.params? router.params.id : 0) || 0;
        this.regionId = Number(router.params? router.params.regionId : 0) || 0;

        if(this.sourceId && this.sourceId > 0) {
            this.bindSource(this.sourceId);
        }
        else {
            this.currentSource.id = 0;
            this.currentSource.description = '';
            this.currentSource.key = '';
            this.currentSource.meta = new Meta();
            this.currentSource.regionId = this.regionId;
            this.currentPublishScript = this.defaultScript;
        }
    }

    async mounted () {
        await this.sourceChange();// 先加载
    }

    // 调用后台接口运行脚本
    async runScript(code) {
        const res = await this.$ajax.requestApi<any, any>({
            code: code
        }, {
            url: '/api/source/runScript'
        });

        if(res && res.ret == 0) {
            return res.data;
        } else {
            this.$message.error('脚本执行失败：'+res.msg);
        }
    }


    // 行颜色
    fieldRowClassName({row, rowIndex}) {
        if(row.isUnique) {
            return 'unique-row';
        }
        return '';
    }

    // 获取并绑定资源
    async bindSource(id) {
        const loading = this.$loading({
            lock: true,
            text: '加载中...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });

        // 先加载可选数据源
        await this.loadAllSource();

        const data = await this.loadSource(id);
        this.currentSource.fromJSON(data);// 绑定
        this.currentPublishScript = data.publishScript || this.defaultScript;

        loading.close();
    }

    // 加载指定的资源信息
    async loadSource(id) {
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
                f.sortable = !!f.sortable;
                f.searchType = f.searchType || 0;
                f.isDisabled = !!f.isDisabled;
                f.sourceConfig = f.sourceConfig || '';
            }
            return rsp.data;
        }
        else {
            this.$message(rsp.msg || '获取数据配置失败');
            return {
                publishScript: ''
            };
        }
    }
    // 加载所有资源，用于选择用
    async loadAllSource() {
        const req = new GetAllSourceReq();
        req.valid = 1;

        const rsp = await this.$ajax.requestApi<GetAllSourceReq,GetAllSourceRsp>(req, {
            method: 'GET'
        });
        if(rsp.ret == 0) {
            // 组装可选数据源
            for(let s of rsp.data) {
                this.allSourceOptions.push({
                    label: s.description,
                    value: s.id,
                    key: s.key,
                    source: s
                });
            }
            this.currentSourceOptions = this.allSourceOptions;
        }
        else {
            this.$message(rsp.msg || '获取数据失败');
            return {};
        }
    }
    // 数据源过滤函数
    sourceFilterMethod(qry) {
        this.currentSourceOptions = this.allSourceOptions.filter((s) => {
            return s.label.includes(qry) || s.key.includes(qry);
        });
    }

    // 保存
    async save() {
        if(!this.currentSource.regionId && this.regionId) this.currentSource.regionId = this.regionId;

        if(!this.currentSource.key) {
            this.$message('key不可为空');
            return false;
        }

        const req = new SaveSourceReq();

        req.data = this.currentSource;

        const loading = this.$loading({
            lock: true,
            text: '保存中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });

        const rsp = await this.$ajax.requestApi<SaveSourceReq,SaveSourceRsp>(req).finally(() => {
            loading.close();
        });
;
        if(rsp.ret == 0) {
            this.$message('保存成功');
            if(!this.currentSource.id) this.currentSource.id = rsp.data.id;
            this.$router.replace(`/source/${this.currentSource.regionId}/${rsp.data.id}`);
        }
        else {
            this.$message(rsp.msg || '保存失败');
        }

        // loading.close();
    }
    // 弹出字段编辑框
    editField(field?: Field) {
        this.fieldDialogVisible = true;
        // 当前编辑字段数据配置
        this.currentFieldDataString = [
            {
                "label": "选项1",
                "value": "1"
                },
                {
                "label": "选项2",
                "value": "2"
            }
        ];
         // 数据源配置
        this.currentFieldDataSource = {
            sourceId: 0, // 数据源id
            label: '', // 显示字段
            value: ''   // 关健值字段
        }
        if(field) {
            this.fieldDialogTitle = '修改字段';
            this.currentField.fromJSON(field);
            this.currentFieldFlag = 1;
            if(field.data) {
                if(field.dataChannel == 'config')
                    this.currentFieldDataString = typeof field.data == 'string'? JSON.parse(field.data) : (field.data);
                else if(field.dataChannel == 'source' && typeof field.data == 'object' && 'sourceId' in field.data) {
                    this.currentFieldDataSource = field.data;
                }
            }
        }
        else {
            this.fieldDialogTitle = '新增字段';
            this.currentField.fromJSON({
                name: '',
                nickName: '',
                default: '',
                type: FieldType.text,
                dataChannel: FieldDataChannel.config,
                isRequired: false,
                isHide: false,
                sortable: false,
                isUnique: false,
                isDisabled: false,
                maxLength: 0,
                searchType: 0,
                data: '',
                sort: 0,
                sourceConfig: ''
            });
            this.currentFieldFlag = 0;
        }
    }
    // 保存字段
    async saveField() {
        this.computedMeta = this.computedMeta || new Meta();
        this.computedMeta.Fields = this.computedMeta.Fields || new Array<Field>();
        try {
            if(!this.currentField.name) {
                this.$message('字段名不能为空');
                return false;
            }
            if(!this.currentField.nickName) {
                this.$message('中文名不能为空');
                return false;
            }
            if(!this.currentField.type) {
                this.$message('请选择字段类型');
                return false;
            }
            else if(this.currentField.type == FieldType.single || this.currentField.type == FieldType.mutiple) {
                // 如果数据选项来自配置 ，则  使用json
                if(this.currentField.dataChannel == 'config') {
                    try {
                        this.currentField.data = typeof this.currentFieldDataString =='string'?JSON.parse(this.currentFieldDataString):this.currentFieldDataString;
                    }
                    catch(e) {
                        this.$message.error('配置json格式不正确 ' + e.message);
                        return false;
                    }
                }
                else if(this.currentField.dataChannel == 'source') {
                    this.currentField.data = this.currentFieldDataSource; // 数据来源配置
                }
                // 脚本配置
                else if(this.currentField.dataChannel == 'script') {
                    this.currentField.data = await this.runScript(this.currentField.sourceConfig)
                }
            }

            for(let f of this.computedMeta.Fields) {
                // 已经存在相同的字段
                if(f.name == this.currentField.name) {
                    if(this.currentFieldFlag === 0) {
                        this.$message('已经存在字段:' + f.name);
                        return false;
                    }
                    else {
                        Object.assign(f, this.currentField);// 修改原属性
                    }
                    break;
                }
            }

            // 新增拷贝字段
            if(this.currentFieldFlag === 0) this.computedMeta.Fields.push(new Field().fromJSON(this.currentField));
            this.fieldDialogVisible = false;
            this.currentSource.meta.Fields = this.computedMeta.Fields;// 刷新
        } catch(e) {
            this.$message.error(e.message);
        }
    }
    // 移除字段
    async deleteField(row) {
        if(await this.$confirm("确认删除？", '') != 'confirm') return;

        for(let i=0; i<this.computedMeta.Fields.length; i++) {
            // 已经存在相同的字段
            if(this.computedMeta.Fields[i].name == row.name) {
                this.computedMeta.Fields.splice(i ,1);
                break;
            }
        }
    }

    // 上移字段
    async upperField(index) {
        this.$confirm('此操作将该字段上移, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'}
        ).then(()=>{
            this.computedMeta.Fields.splice(index-1, 0 , this.computedMeta.Fields.splice(index, 1)[0])
        }).catch(()=> {
            this.$message.info('已取消上移操作')
        });
    }

    // 下移字段
    async downField(index) {
        this.$confirm('此操作将该字段下移, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'}
        ).then(()=>{
            this.computedMeta.Fields.splice(index+1, 0 , this.computedMeta.Fields.splice(index, 1)[0]);
        }).catch(()=> {
            this.$message.info('已取消下移操作')
        });
    }

    // 确定修改脚本
    savePublishScript() {
        this.currentSource.publishScript = this.currentPublishScript;
        this.publishScriptDialogVisible = false
    }

    // 获取字段类型中文名字
    getFieldTypeName(v) {
        for(let t of this.fieldTypeMap) {
            if(t.value == v) return t.label;
        }
        return v;
    }
}

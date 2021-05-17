


import { Vue, Prop, Component, Watch } from 'vue-property-decorator';

@Component
export default class MapData extends Vue {
    

    /**
     * map数据
     */
    @Prop()
    private data?: object | undefined;  
    
    items = [] as any;

    // 结果保存结构
    get result() {
        const data = {} as any;
        for(const item of this.items) {
            if(!item || !item.key) continue;
            data[item.key] = item.value;
        }
        return data;
    }
    
    initData() {   
        
         this.items = [];  
        if(!this.data) {
            this.data = {};
        }
        if(this.data) {
            for(const key in this.data) {
                this.items.push({
                    key,
                    value: this.data[key]
                });
            }
        }
        if(!this.items.length) {
            this.items.push({
                key: '',
                value: ''
            });
        }
    }

    // 数据发生改变时，重新生成值
    dataChange() {
        console.log(this.result);
        this.$emit('dataChange', this.result);
    }

    addItem() {
        this.items.push({
            key: '',
            value: ''
        });
        this.dataChange();
    }

    mounted () {
        this.initData();
    }
}

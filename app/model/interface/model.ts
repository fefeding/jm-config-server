
/**
 * 定义一个基础model，所有都继承它，实现复制初始化model实例的能力
 */
 export default class Model {
    /**
     * 可以指定一个对象来复制成当前class实例
     * @param data 跟当前model字段对应的json对象，用来复制当前class
     */
    constructor(data? : any) {
        if(data) {
            this.fromJSON!(data);
        }
    }

    /**
     * 从json对象拷贝属性
     * @param json json对象
     */
    fromJSON?(json: object | string) {
        if(typeof json === 'string') {
            json = JSON.parse(json);
        }
        Object.assign(this, json);
        return this;
    }

    /**
     * 把一个数组对象转为当前class数组
     * @param source 原数组
     */
    static fromArray<T extends Model>(source: any, model: { new(data?):T}): T[] {        
        const arr = Array<T>();
        if(Array.isArray(source)) {
            for(let s of source) {
                const m = new model();
                m.fromJSON!(s);
                arr.push(m);
            }
        }
        return arr;
    } 
}



/**
 * 源数据结构
 */
 export class DataStruct extends Model {
    [key: string]: string|number|Array<string>|Map<string, string>|Function|DataStruct|{
        label: string,
        value: string | number
    }|Array<DataStruct>
}
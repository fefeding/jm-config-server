export enum EMaterialType {
    '一页通' = 0,
    'Pitchbook' = 1,
    'Q&A' = 2,
    'Salestalk' = 3,
    '售后报告' = 4,
    '资产策略配置报告' = 5,
    '产品研究月报' = 6,
    '培训音频' = 7
}

/**
 * 数据有效性: 1:有效 0:无效，默认为1
 */
export enum EValid {
    /**
     * 有效
     */
    Valid = 1,
    /**
     * 无效
     */
    Unvalid = 0
}

export enum EReleaseState {
    初始状态 = 0,
    修改未发布 = 1,
    已发布 = 3
}

/**
 * 日志状态
 */
export enum PublishLogState {
    none = 0, // 未知
    success = 1, // 成功
    failed = 2  // 失败
} 
   

/**
 * 查询方式
 */
 export enum FieldSearchType {
    /**
     * 未指定
     */
    none = 0,
    /**
     * 全匹配(=)
     */       
    equal = 1,
    /**
     * 右模糊(...%)
     */  
    rightMatch = 2,
    /**
     * 左模糊(%...)
     */  
    leftMatch = 3,
    /**
     * 全模糊(%...%)
     */  
    allMatch = 4
}

/**
 * 字段选项数据来源
 */
 export enum FieldDataChannel {
    /**
     * 手动配置
     */
    config = 'config',
    /**
     * 来自数据源
     */
    source = 'source'
}

/**
 * 字段类型
 */
 export enum FieldType {
    /**
     * 单行文本
     */
    text = 'text',
    /**
     * 多行文本
     */
    content = 'content',
    /**
     * 随机码
     */
    random = 'random',
    /**
     * 数字
     */
    number = 'number',
    /**
     * key value 数据结构
     */
    map = 'map',
    /**
     * 数据类型
     */
    datetime = 'datetime',
    /**
     * 单选项
     */
    single = 'single',
    /**
     * 多选项
     */
    mutiple = 'mutiple',
    /**
     * 配置一个图片url
     */
    image = 'image',
    /**
     * 上传文件
     */
    file = 'file',
    /**
     * json字段
     */
    json = 'json'
}

export default {
    EValid
}



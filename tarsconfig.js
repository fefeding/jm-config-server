
const TarsConfig = require('@tars/config');

// 缓存配置文件监控
const ConfigWatchCache = {};
var tarsInstance = null;

function initTarsInstance() {
    if(process.env.TARS_CONFIG && !tarsInstance) {
        tarsInstance = new TarsConfig();
        // 监听config push
        tarsInstance.on("configPushed", async function(filename) {
            console.log("config pushed", filename);

            // 配置更新触发
            const opt = ConfigWatchCache[filename];
            if(!opt || !opt.configPushed) return;

            
            const conf = await loadCosConfig(filename);// 去加载这个配置
            opt.configPushed(conf); // 回调更新
        });
    }
}

// 加载配置
async function loadCosConfig(filename, options={
    format: 'JSON'
}) {

    initTarsInstance();

    if(!tarsInstance) return;

    const con = await tarsInstance.loadConfig(filename, options);

    console.log('加载配置 ' + filename, con);

    return con;
}

// 监控配置更新
async function loadAndWatchConfig(filename, options = {
    format: 'JSON'
}){
    initTarsInstance();

    if(!tarsInstance) return null;


    ConfigWatchCache[filename] = options;// 缓存起来，以备push更新回调用

    const conf = await loadCosConfig(filename, options); // 主动加载配置

    // 如果有回调更新
    // @ts-ignore
    if(options.configPushed) {
        // @ts-ignore
        options.configPushed(conf);
    }

    return conf;  
}

module.exports = {
    loadCosConfig,
    loadAndWatchConfig
}
'use strict';

const devops = require('./devops.config.js');
// 静态发布路径
const publicPath = devops.prefix ? `/${devops.prefix}/public/` : '/public/';

module.exports = {
    entry: {
        home: 'app/web/page/index.ts'
    },
    output: {
        publicPath
    },
    lib: ['vue', 'vuex', 'vue-router', 'vuex-router-sync', 'axios'],
    loaders: {
        babel: false,
        typescript: true
    },
    plugins: {
        imagemini: false,
        copy: [
            {
                from: 'app/web/asset',
                to: 'asset'
            }
        ]
    }
};

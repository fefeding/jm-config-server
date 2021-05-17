import Vue from 'vue';
import VueRouter from 'vue-router';
import Dashboard from '../page/dashboard/index.vue';
import Source from '../page/source/index.vue';
import SourceData from '../page/source/data.vue';
import Region from '../page/source/region.vue';
import SourceEdit from '../page/source/edit.vue';
import PublishHistory from '../page/source/publishHistory.vue';

Vue.use(VueRouter);

export default function createRouter(state) {
    return new VueRouter({
        mode: 'history',
        base: state.prefix ? `/${state.prefix}/` : '/',
        routes: [
            {
                path: '/',
                component: Dashboard
            },
            {
                path: '/source/data/:id',
                component: SourceData
            },
            {
                path: '/region/:parentId/:id',
                component: Region
            },
            {
                path: '/source/:regionId/:id',
                component: SourceEdit
            },
            {
                path: '/publish/log/:id',
                component: PublishHistory
            },
            {
                path: '/tools/userInfo',
                component: () => import('../page/tools/userInfo.vue')
            },
            {
                path: '/tools/long2ShortUrl',
                component: () => import('../page/tools/long2ShortUrl.vue')
            },
            {
                path: '/tools/wxMenu',
                component: () => import('../page/tools/wxMenu.vue')
            },
            {
                path: '/tools/wxQRCode',
                component: () => import('../page/tools/wxQRCode.vue')
            },
            {
                path: '/tools/zjWhite',
                component: () => import('../page/tools/zjWhite.vue')
            },
            {
                path: '/tools/whiteManager',
                component: () => import('../page/tools/whiteManager/manager.vue')
            },
            {
                path: '/tools/act/product',
                component: () => import('../page/tools/actManager/product.vue')
            },
            {
                path: '/tools/act/user',
                component: () => import('../page/tools/actManager/user.vue')
            },
            {
                path: '/tools/act/discountLog',
                component: () => import('../page/tools/actManager/discountLog.vue')
            },
            {
                path: '/tools/ic/msg',
                component: () => import('../page/tools/ic/msg.vue')
            }
        ]
    });
}

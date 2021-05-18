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
            }
        ]
    });
}

import { Vue, Component, Prop } from 'vue-property-decorator';

import { GetSourceByRegionReq, GetSourceByRegionRsp, Source } from '../../../../model/interface/sourceData';
import { QueryRegionTreeReq, QueryRegionTreeRsp } from '../../../../model/interface/sourceRegion';

import MenuTree from './menuTree.vue';

@Component({
    components: {
        MenuTree
    }
})
export default class Menu extends Vue {
    @Prop()
    private collapse: boolean = false;

    // 当前菜单，采用从store取读取
    menus = new Array<any>();
    defaultMenuOpeneds = new Array<string>();

    async mounted () {
        // 加载菜单
        this.menus = await this.loadMenus();
    }

    // 目录和数据源转为菜单项
    // deep为层级，2级以内自动展开
    convertMenu(m, deep?) {
        const isSource = m.regionId > 0;// 如果是目录的数据源，
        const id = (isSource?'source_':'region_') + m.id;
        const menu = {
            name: m.name || m.description,
            id,
            data: m,
            isSource,
            icon: isSource?'el-icon-coin':'el-icon-menu',
            path: isSource? `/source/data/${m.id}` : `/region/${m.parentId}/${m.id}`,
            children: new Array<any>()
        };
        deep = deep || 0;
        // 二级菜单默认展开
        //if(deep < 1) {
        //    this.defaultMenuOpeneds.push(menu.path);
        //}
        if(m.children && m.children.length) {
            deep ++;
            for(let cm of m.children) {
                menu.children.push(this.convertMenu(cm, deep));
            }
        }
        // 如果其下有数据源，则显示其菜单
        if(m.Sources && m.Sources.length) {
            for(let s of m.Sources) {
                menu.children.push(this.convertMenu(s, deep));
            }
        }
        return menu;
    }

    // 加载菜单
    async loadMenus() {
        const menus = await this.loadRegions();
        return menus;
    }

    // 加载所有目录
    async loadRegions(): Promise<Array<any>> {
        const req = new QueryRegionTreeReq();
        req.containSource = true;// 同时拉取目录下的数据源
        const rsp = await this.$ajax.requestApi<QueryRegionTreeReq, QueryRegionTreeRsp>(req, {
            method: 'GET'
        });

        const tmpmenus = new Array<any>();
        if(Array.isArray(rsp.data)) {
            for(let m of rsp.data) {
                tmpmenus.push(
                    this.convertMenu(m)
                );
            }
        }
        else if(Array.isArray(rsp.data.children)) {
            for(let m of rsp.data.children) {
                tmpmenus.push(
                    this.convertMenu(m)
                );
            }
        }
        else {
            tmpmenus.push(
                this.convertMenu(rsp.data)
            );
        }
        return tmpmenus;
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
    }
}

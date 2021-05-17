<template>
<div style="min-width: 95%;">
        <el-row>
        <el-button type="primary" :loading="isPublishing" @click="publish()">{{ isPublishing?'发布中':'发布' }}</el-button>
    </el-row>
    <hr >
    <el-row :gutter="10">
        <el-col :xs="4" :sm="6" :md="8" :lg="9" :xl="11">
            <div class="grid-content bg-purple-light">
            <el-tree
            ref="wxMenuTree"
            :data="menus"
            show-checkbox
            node-key="id"
            default-expand-all
            @node-click="selectMenu"
            :expand-on-click-node="false">
            <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>{{ data.name }}</span>
                <span>
                <el-button
                    v-if="data.deep < 2"
                    type="text"
                    size="mini"
                    @click="() => append(data)">
                    添加子菜单
                </el-button>
                <el-button
                    v-if="data.deep > 0"
                    type="text"
                    size="mini"
                    @click="() => remove(node, data)">
                    移除
                </el-button>
                </span>
            </span>
            </el-tree>
            </div></el-col>
        <el-col :xs="4" :sm="6" :md="8" :lg="9" :xl="11"><div class="grid-content bg-purple">
            <el-form v-if="editMenu" :model="editMenu" status-icon ref="menuForm" label-width="100px">
            <el-form-item label="类型" prop="type">
                <el-select v-model="editMenu.type" placeholder="请选择">
                    <el-option
                    v-for="item in typeOptions"
                    :key="item.value"
                    :label="item.label"
                    :disabled="item.disabled"
                    :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="菜单名" prop="name">
                <el-input type="text" v-model="editMenu.name" maxlength="16" minlength="2"></el-input>
            </el-form-item>
            <el-form-item label="地址" prop="url">
                <el-input v-model="editMenu.url" type="text" maxlength="512" minlength="10"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="saveMenu()">保存</el-button>
            </el-form-item>
            </el-form>
        </div></el-col>
    </el-row>    
</div>
</template>
<style>
  .el-col {
    border-radius: 4px;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
</style>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

// 菜单类型
enum MenuType {
    // 跳转网页
    'view' = 'view',
    'click' = 'click', // 点击类型
    'miniprogram' = 'miniprogram',  // 小程序类型
}

@Component({
    components: {
        
    }
})
export default class wxMenu extends Vue {

    
    menus= [];
    // 当前编辑菜单
    currentMenu = null;
    // 当前正在编辑的菜单
    editMenu = null;
    isPublishing = false;

    typeOptions = [
        {
            value: MenuType.view,
            label: '跳转页面'
        },{
            value: MenuType.miniprogram,
            label: '跳转小程序',
            disabled: true
        },{
            value: MenuType.click,
            label: '点击',
            disabled: true
        }
    ];

    mounted () {
        this.queryWXMenus();        
    }
    // 拉取当前菜单
    async queryWXMenus() {
        //@ts-ignore
        const res = await this.$ajax.requestApi<any, any>({
            url: '/api/tool/queryWXMenus'
        });
        console.log(res);
        if(res.ret == 0) {
            this.menus = this.convertToTree(res.data);
        }
    }

    // 发布
    async publish() {
        //@ts-ignore
        const frm = await this.$confirm('确定发布菜单?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        if(!frm) return;
        const data = this.convertWxMenus(this.menus);// 转为微信保存的格式
        
        this.isPublishing = true;
        try {
            //@ts-ignore
            const res = await this.$ajax.requestApi<any, any>({
                url: '/api/tool/publishyWXMenus',
                data
            });
            console.log(res);
            if(res.ret == 0 && res.data.errcode == 0) {
                //@ts-ignore
                this.$message.success('发布成功');
                this.queryWXMenus();   
            }
            else {
                //@ts-ignore
                this.$message.error('发布失败：' + res.msg || res.data.errmsg);
            }
        }
        catch(e) {
            //@ts-ignore
            this.$message.error('发布失败：' + e.message);
        }
        finally{
            this.isPublishing = false;
        }
    }

    // 新增子菜单
    append(data) {
        const deep = data.deep+1;
        // @ts-ignore
        const menu = { deep: deep, name: '', url: '', type: MenuType.view, children: [], id: deep + '_' + Date.now() };
        if (!data.children) {
          this.$set(data, 'children', []);
        }
        data.children.push(menu);

        this.$nextTick(()=>{
            
            // @ts-ignore
            this.$refs.wxMenuTree.setCurrentKey(menu.id);
            // @ts-ignore
            //this.$refs.wxMenuTree.setCurrentNode(node);
             setTimeout(()=>{
                 this.selectMenu(menu);
             }, 500);
        });
      }

    // 移除子菜单
      async remove(node, data) {
          // @ts-ignore
        const frm = await this.$confirm('确定删除当前菜单?', '提示', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        });
        if(frm) {
            const parent = node.parent;
            const children = parent.data.children || parent.data;
            const index = children.findIndex(d => d.id === data.id);
            children.splice(index, 1);
        }
      }
        // 选择菜单
      selectMenu(data) {          
          this.currentMenu = data;
          this.editMenu = data;
      }

        // 保存菜单修改
      saveMenu() {
          if(!this.editMenu.name) {
              // @ts-ignore
              this.$message.error('菜单名称不能为空');
              return;
          }
          Object.assign(this.currentMenu, this.editMenu);
            // @ts-ignore
          this.$message.success('保存数据成功，如果要生效请发布');
      }

    /**
     * 把微信菜单转换为tree数据格式
     */
    convertToTree(data, deep = 0): Array<any>|any {
        const isRoot = data.selfmenu_info && data.selfmenu_info.button;
        // 取菜单数组
        if(isRoot) {
            data = data.selfmenu_info.button;
        }        

        if(isRoot || Array.isArray(data)) {
            const menus = [];            
            for(const b of data) {
                menus.push(
                    this.convertToTree(b, deep + 1)
                );
            }

            // 如果是根，则加入一个根菜单
            if(isRoot) {
                return [{
                    name: '公众号菜单',
                    children: menus,
                    id: 1,
                    deep
                }];
            }
            return menus;
        }
        else {
            const menu = {
                name: data.name || '',
                type: data.type,
                url: data.url,
                key: data.key,
                id: deep + '_' + Date.now() + Math.random()*1000,
                deep,
                children: []
            };
            // 子菜单
            if(data.sub_button && data.sub_button.list) {
                menu.children = this.convertToTree(data.sub_button.list, deep + 1);
            }
            return menu;
        }
    }
    // 转为微信保存的菜单格式
    convertWxMenus(menus) {
        let data = {} as any;
        if(Array.isArray(menus)) {
            // 是根菜单
            if(menus.length === 1 && menus[0].deep === 0) {
                data.button = [];
                menus = menus[0].children;
            }
            else {
                data = [];
            }
            const children = data.button || data;
            for(const m of menus) {
                const wxmenu = this.convertWxMenus(m);
                children.push(wxmenu);
            }
        }
        else {
            data = {
                name: menus.name,
                type: menus.type,
                key: menus.key,
                url: menus.url
            };
            if(menus.children && menus.children.length) {
                data.sub_button = this.convertWxMenus(menus.children);
            }
        }
        return data;
    }
}

</script>

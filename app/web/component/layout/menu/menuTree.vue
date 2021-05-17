<template>
    <div>
        <template v-for="(menu, menuindex) in menuData">
            <el-submenu :index="menu.path" :key="menu.id" v-if="menu.children && menu.children.length">
                <template slot="title">
                    <i :class="menu.icon"></i>
                    <span slot="title">{{ menu.name }}</span>
                    <el-button
                            v-if="menu.data && menu.data.id"
                            type="text"
                            size="small"
                            icon="el-icon-edit"
                            @click.stop="editRegionORSource(menu)"
                            circle>
                    </el-button>
                </template>
                <MenuTree :menuData="menu.children"></MenuTree>
            </el-submenu>
            <el-menu-item :index="menu.path" :key="menu.id" v-else>
                <i :class="menu.icon"></i>
                <span slot="title">{{ menu.name }}</span>
            </el-menu-item>
        </template>
    </div>
</template>

<script>
  export default {
    props: ['menuData'],
    name: 'MenuTree',
    methods: {
        // 跳转目录编辑
        editRegionORSource(menu) {
            // 不是数据源就是目录
            if(!menu.isSource) {
                this.$router.push(`/region/${menu.data.parentId}/${menu.data.id}`);
            }
        }
    }
  }
</script>

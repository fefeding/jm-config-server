<template>
    <div class="main">
        <LayoutHeader></LayoutHeader>
        <LayoutContent>
            <div slot="content"><slot name="main"></slot></div>
        </LayoutContent>
    </div>
</template>
<style>
.main {
    display: flex;
}
.main .el-menu:not(.el-menu--collapse) {
    width: 230px;
}
.main .app {
    width: 100%;
    background-color: #ecf0f5;
}
.main .app-body {
    width: 100%;
    -webkit-transition: margin-left 0.35s;
    transition: margin-left 0.35s;
}
.main .main-container {
    margin-top: 50px;
    padding: 10px;
    min-height: calc(100vh - 100px);
}
</style>
<script lang="ts" src="./index.ts"></script>

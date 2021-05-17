<template>
    <div style="font-size: 24px; text-align: left; max-width: 800px;">
        <el-form :model="currentSourceRegion" ref="sourceRegionForm" label-width="80px">
            <el-form-item
              label="父菜单">
              <el-cascader
                v-model="parentId"
                :filterable = "true"
                :options="parentOptions"
                :show-all-levels="false"
                :props="{ expandTrigger: 'hover',checkStrictly: true }"></el-cascader>
            </el-form-item>
            <el-form-item
              label="目录名"
              :rules="[
                { required: true, message: '目录名不能为空'}
              ]"
            >
              <el-input type="text" v-model.number="currentSourceRegion.name" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="save()">保存</el-button>
              <el-button @click="createRegion(0)" v-if="currentSourceRegion.id > 0">创建同级目录</el-button>
              <el-button @click="createRegion(1)" v-if="currentSourceRegion.id > 0">创建子目录</el-button>
              <el-button @click="createSourceData()" v-if="currentSourceRegion.id > 0">创建数据源</el-button>
              <el-button type="danger" icon="el-icon-delete" circle @click="deleteRegion()" size="mini" v-if="currentSourceRegion.id > 0"></el-button>
            </el-form-item>
          </el-form>
    </div>
  </template>
  <script type="ts" src="./region.ts"></script>

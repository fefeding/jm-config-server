<template>
<div>
    <el-row :gutter="20" v-for="(item,index) in items" :key="index">
    <el-col :span="4">
        <el-input v-model="item.key" :maxlength="36" :minlength="2" @change="dataChange"></el-input>
     </el-col>
    <el-col :span="10">
        <el-input v-model="item.value" :maxlength="128" :disabled="disabled" show-word-limit @change="dataChange"></el-input>
    </el-col>
    <el-col :span="6">
        <el-button v-if="index===items.length-1" type="primary" icon="el-icon-plus" circle @click="addItem"></el-button>
    </el-col>
    </el-row>
</div>
</template>
<style>
.el-col {
    border-radius: 4px;
  }
  .el-row {
      margin: 4px 0;
  }
</style>
<script lang="ts" src="./mapData.ts"></script>

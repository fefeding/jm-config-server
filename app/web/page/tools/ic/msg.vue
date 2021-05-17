<template>
<div style="min-width: 95%;">
    
  <el-form ref="form" label-width="80px">
  <el-form-item label="loginID">
    <el-input
            type="textarea"
            :rows="5"
            placeholder="多行表示多个ID"
            v-model="editLoginIds">
        </el-input>
  </el-form-item>
  <el-form-item label="图片">
    <el-input
            type="text"
            placeholder="输入图片地址"
            v-model="picurl">
        </el-input>
        <img :src="picurl" style="height: 80px;" />
  </el-form-item>
  <el-form-item>
    <el-button @click="sendMsg()">发送</el-button>
  </el-form-item>
</el-form>
</div>
</template>
<script lang="ts" src="./msg.ts"></script>

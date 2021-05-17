<template>
<div style="min-width: 95%;">
    <el-row>
        <el-form>
            <el-form-item label="证件类型">
                <el-select v-model="actionRequestData.id_type" placeholder="请选择类型" >
                    <el-option
                    v-for="item in idTypes"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    :disabled="item.disabled">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="证件号码">
                <el-input v-model="actionRequestData.id_card" maxlength="64" minlength="15" show-word-limit></el-input>
            </el-form-item>
            <el-form-item label="姓名">
                <el-input v-model="actionRequestData.name" maxlength="16" show-word-limit></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addWhite()" >添加白名单</el-button>
              <el-button type="warning" @click="deleteWhite()" >删除白名单</el-button>
              <el-button type="info" @click="queryWhite()" >查询白名单</el-button>
            </el-form-item>
        </el-form>
    </el-row>
    <el-table
      :data="ActionData"
      stripe
      style="width: 100%">
      <el-table-column
        prop="targetId"
        label="证件号">
      </el-table-column>
      <el-table-column
        prop="content"
        label="内容">
      </el-table-column>
      <el-table-column
        prop="creator"
        label="操作人">
         <template slot-scope="scope">
                <StaffUserName :staffId="scope.row.creator" domain=""></StaffUserName>
              </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="操作时间">        
            <template slot-scope="scope">
                <span style="font-size: smaller;" v-html="renderDate(scope.row.createTime)"></span>
              </template>
      </el-table-column>
    </el-table>
</div>
</template>
<script lang="ts" src="./zjWhite.ts"></script>

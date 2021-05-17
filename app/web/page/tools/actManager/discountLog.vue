<template>
<div style="min-width: 95%;">
    <el-row>
        <el-form :inline="true">
            <el-form-item label="loginID">
                <el-input v-model="queryParam.loginId" maxlength="16" show-word-limit></el-input>
            </el-form-item>
            <el-form-item label="产品ID">
                <el-input v-model="queryParam.productId" maxlength="32" show-word-limit></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="info" @click="query()" >查询</el-button>
            </el-form-item>
        </el-form>
    </el-row>
    <el-table
      :data="whiteData"
      :cell-class-name="({row, column}) => {if(column.property == 'Fdeal_status' && row.Fdeal_status == 2) return 'error-row';}"
      style="width: 100%">      
      <el-table-column
        prop="Flogin_id"
        label="loginId">
      </el-table-column>     
      <el-table-column
        prop="Fproduct_id"
        label="产品ID">
      </el-table-column>
      <el-table-column
        prop="Fstatus"
        label="状态">        
         <template slot-scope="scope">
                {{scope.row.Fstatus==1?'有效':'无效'}}
              </template>
      </el-table-column>
      <el-table-column
        prop="Fdeal_status"
        label="处理状态">
         <template slot-scope="scope">
                {{{2:'处理失败',1:'处理成功',0:'待处理'}[scope.row.Fdeal_status]}}
              </template>
      </el-table-column>    
      <el-table-column
        prop="Fmsg"
        label="信息">
      </el-table-column>
      <el-table-column
        prop="Fmodify_time"
        label="操作时间">        
            <template slot-scope="scope">
                <span style="font-size: smaller;" v-html="renderDate(scope.row.Fmodify_time)"></span>
              </template>
      </el-table-column>
      <el-table-column
        prop="Fupdater"
        label="操作人">
         <template slot-scope="scope">
                <StaffUserName :staffId="scope.row.Fupdater" domain=""></StaffUserName>
          </template>
      </el-table-column>       
    </el-table>
    <el-pagination
    background
    layout="prev, pager, next"
    :page-size="queryMeta.count"
    :current-page.sync="queryMeta.page"
    :total="totalCount"
    @current-change="query">
    </el-pagination>
</div>
</template>
<style>
  .el-table .warning-row {
    color: oldlace;
  }
  .el-table .error-row {
    color:red;
  }

  .el-table .success-row {
    color: #f0f9eb;
  }
</style>
<script lang="ts" src="./discountLog.ts"></script>

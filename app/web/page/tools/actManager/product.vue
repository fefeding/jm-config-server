<template>
<div style="min-width: 95%;">
    <el-row>
        <el-form :inline="true">
            <el-form-item label="产品名称">
                <el-input v-model="queryParam.name" maxlength="64" minlength="15" show-word-limit></el-input>
            </el-form-item>
            <el-form-item label="产品ID">
                <el-input v-model="queryParam.id" maxlength="16" show-word-limit></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="info" @click="query()" >查询</el-button>
              <el-button type="primary" @click="editProduct()" >新增</el-button>
            </el-form-item>
        </el-form>
    </el-row>
    <el-table
      :data="productData"
      stripe
      :cell-class-name="({row, column}) => {if(column.property == 'Fdeal_status' && row.Fdeal_status == 2) return 'error-row';}"
      style="width: 100%">
      <el-table-column
        prop="Fproduct_id"
        label="产品ID">
      </el-table-column>
      <el-table-column
        prop="Fproduct_brief_name"
        label="产品名称">
      </el-table-column>
      <el-table-column
        prop="Fdiscount_rate"
        label="打折率">
      </el-table-column>
      <el-table-column
        prop="Fstatus"
        label="状态">        
         <template slot-scope="scope">
                {{{1:'有效',0:'无效'}[scope.row.Fstatus]}}
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
        prop="Fupdater"
        label="操作人">
         <template slot-scope="scope">
                <StaffUserName :staffId="scope.row.Fupdater" domain=""></StaffUserName>
          </template>
      </el-table-column>
      <el-table-column
        prop="Fmodify_time"
        label="操作时间">        
            <template slot-scope="scope">
                <span style="font-size: smaller;" v-html="renderDate(scope.row.Fmodify_time)"></span>
              </template>
      </el-table-column>
        <el-table-column
        label="操作">
            <template slot-scope="scope">
                <el-button @click="editProduct(scope.row)" type="text" size="small">编辑</el-button>
                <el-button v-if="scope.row.Fstatus==0" type="text" @click="setStatus(scope.row.Fproduct_id, 1, '启用')" size="small">启用</el-button>
                <el-button v-if="scope.row.Fstatus==1" type="text" @click="setStatus(scope.row.Fproduct_id, 0, '废弃')" size="small">废弃</el-button>
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
    <el-dialog
  title="产品折扣"
  :visible.sync="dialogEditProductVisible"
  width="30%">
  <el-form ref="form" :model="editProductData" label-width="80px">
  <el-form-item label="产品ID">
    <el-input v-model="editProductData.id" maxlength="64"></el-input>
  </el-form-item>
  <el-form-item label="产品名称">
    <el-input v-model="editProductData.name" maxlength="64"></el-input>
  </el-form-item>
  <el-form-item label="折扣率">
    <el-input v-model="editProductData.rate" maxlength="64" placeholder="例如:0.1"></el-input>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="onSave">保存</el-button>
    <el-button @click="()=>{this.dialogEditProductVisible=false}">取消</el-button>
  </el-form-item>
</el-form>
</el-dialog>
</div>
</template>
<style>
  .el-table .warning-row {
    color: oldlace;
  }
  .el-table .error-row {
    color: red;
  }

  .el-table .success-row {
    color: #f0f9eb;
  }
</style>
<script lang="ts" src="./product.ts"></script>

<template>
<div style="min-width: 95%;">
    <el-row>
        <el-form :inline="true">
            <el-form-item label="包名称">
                <el-input v-model="queryParam.name" maxlength="64" minlength="15" show-word-limit></el-input>
            </el-form-item>
            <el-form-item label="loginID">
                <el-input v-model="queryParam.loginId" maxlength="16" show-word-limit></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="info" @click="queryWhite()" >查询</el-button>
              <el-button type="primary" @click="editConfig()" >新增白名单包</el-button>
            </el-form-item>
        </el-form>
    </el-row>
    <el-table
      :data="whiteData"
      stripe
      style="width: 100%">
      <el-table-column
        prop="Fwhite_list_id"
        label="包ID">
      </el-table-column>
      <el-table-column
        prop="Fname"
        label="包名称">
      </el-table-column>
      <el-table-column
        prop="Fstatus"
        label="状态">        
         <template slot-scope="scope">
                {{whiteStatus[scope.row.Fstatus]}}
              </template>
      </el-table-column>
      <el-table-column
        prop="Fexpire_time"
        label="过期时间">        
         <template slot-scope="scope">
               <span style="font-size: smaller;" v-html="renderDate(scope.row.Fexpire_time)"></span>
              </template>
      </el-table-column>
      <el-table-column
        prop="Ftype"
        label="类型">        
         <template slot-scope="scope">
                {{scope.row.Ftype==1?'内部':'外部'}}
              </template>
      </el-table-column>
      <el-table-column
        prop="Fcreator"
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
                <el-button @click="editConfig(scope.row)" type="text" size="small">编辑</el-button>
                <el-button @click="editData(scope.row)" type="text" size="small">管理</el-button>
                <el-button v-if="scope.row.Fstatus==0 || scope.row.Fstatus==2" type="text" @click="setStatus(scope.row.Fwhite_list_id, 1, '通过审核')" size="small">通过审核</el-button>
                <el-button v-if="scope.row.Fstatus==0 || scope.row.Fstatus==1" type="text" @click="setStatus(scope.row.Fwhite_list_id, 2, '废弃')" size="small">废弃</el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination
    background
    layout="prev, pager, next"
    :page-size="queryMeta.count"
    :current-page.sync="queryMeta.page"
    :total="totalCount"
    @current-change="queryWhite">
    </el-pagination>
    <el-dialog
  title="白名单包"
  :visible.sync="dialogEditConfigVisible"
  width="30%">
  <el-form ref="form" :model="editWhiteConfig" label-width="80px">
  <el-form-item label="包名称">
    <el-input v-model="editWhiteConfig.name" maxlength="64"></el-input>
  </el-form-item>
  <el-form-item label="类型">
    <el-select v-model="editWhiteConfig.type" placeholder="">
      <el-option label="内部" value="1"></el-option>
      <el-option label="外部" value="2"></el-option>
    </el-select>
  </el-form-item>
  <el-form-item label="过期时间">    
      <el-date-picker type="datetime" placeholder="选择日期" v-model="editWhiteConfig.expireTime" format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="onSave">保存</el-button>
    <el-button @click="()=>{this.dialogEditConfigVisible=false}">取消</el-button>
  </el-form-item>
</el-form>
</el-dialog>

    <el-dialog
    append-to-body="true"
  :close-on-click-modal="false"
  :close-on-press-escape="false"
  title="白名单包管理"
  :visible.sync="dialogEditDataVisible"
  width="80%">
    <whiteData :editDataConfig="editDataConfig" v-if="dialogEditDataVisible"></whiteData>
</el-dialog>
</div>
</template>
<script lang="ts" src="./manager.ts"></script>

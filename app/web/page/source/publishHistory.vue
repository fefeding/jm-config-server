<template>
    <div style="min-width: 95%;">
    <el-row>
        <el-form :inline="true">
            <el-form-item label="状态">
            </el-form-item>
            <el-form-item>
              <el-button type="primary" >查询</el-button>
            </el-form-item>
        </el-form>
    </el-row>
    <el-table
        border
        stripe
        :data="logs"
        style="width: 100%">
        <el-table-column
            prop="id"
            label="id">
        </el-table-column>
        <el-table-column
            prop="state"
            label="发布状态">
            <template slot-scope="scope">
                <el-link :type="scope.row.state==1?'success':'danger'" v-html="renderStateCell(scope.row)"></el-link>
            </template>
        </el-table-column>
        <el-table-column
            prop="creator"
            label="发布人">
            <template slot-scope="scope">
                <StaffUserName :staffId="scope.row.creator" domain=""></StaffUserName>
              </template>
        </el-table-column>
        <el-table-column
            prop="createTime"
            label="发布时间">
            <template slot-scope="scope">
                <span style="margin-left: 2px" v-html="renderDateCell(scope.row.createTime, 'YYYY-MM-DD HH:mm:ss')"></span>
            </template>
        </el-table-column>
        <el-table-column
        label="操作"
        width="100">
            <template slot-scope="scope">
                <el-button @click="showLogDetail(scope.row)" type="text" size="small">查看</el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination
        background
        layout="prev, pager, next"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="totalCount"
        @current-change="pageChange">
    </el-pagination>
    <el-dialog
  title="日志详情"
  :visible.sync="logDetailDialogVisible"
  :close-on-click-modal="false"
  :close-on-press-escape="false"
  width="60%">
  <el-form label-width="0" style="width: 100%; height: 100%;">
    <el-form-item label="">
        <el-input
            type="textarea"
            readonly
            :autosize="{ minRows: 20, maxRows: 60}"
            v-model="currentLog.content">
        </el-input>
      </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="()=>{this.logDetailDialogVisible=false}">确 定</el-button>
    </el-form-item>
  </el-form>
  </el-dialog>
</div>
</template>
<style>
.el-table .unique-row {
    background: #f0f9eb;
}
</style>
<script lang="ts" src="./publishHistory.ts"></script>

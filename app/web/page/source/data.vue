<template>
    <div style="min-width: 95%;">
    <el-row>
        <el-button type="primary" :loading="isPublishing" @click="publish()">{{ isPublishing?'发布中':'发布' }}</el-button>
        <el-button @click="editSource">编辑数据源</el-button>
        <el-button type="danger" icon="el-icon-delete" circle @click="deleteSource()" size="mini" v-if="remoteSource && remoteSource.id > 0"></el-button>
        <el-button type="text" size="mini" @click="()=>this.$router.push('/publish/log/' + this.remoteSource.id)">发布记录</el-button>
    </el-row>
    <hr >
    <el-row v-if="hasSearch">
        <el-form :inline="true">
            <el-form-item v-if="hasSearch" :label="item.field.nickName" v-for="item in searchFields" v-bind:key="item.field.name">
                <el-input v-model="item.value" v-if="item.field.type == 'text' || item.field.type == 'content' || item.field.type == 'image' || item.field.type == 'number' || item.field.type == 'datetime'"></el-input>
                <el-select v-model="item.value" clearable filterable placeholder="请选择" v-if="item.field.type == 'single'">
                    <el-option
                        v-for="opt in item.field.data"
                        :key="opt.value"
                        :label="opt.label"
                        :value="opt.value">
                    </el-option>
                </el-select>
                <el-select v-model="item.value" clearable filterable multiple placeholder="请选择" v-if="item.field.type == 'mutiple'">
                    <el-option
                        v-for="(opt, index) in item.field.data"
                        :key="index"
                        :label="opt.label"
                        :value="opt.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="()=> {currentPage=1;filterData()}" >查询</el-button>
            </el-form-item>
        </el-form>
    </el-row>
    <el-table
        v-if="remoteSource && remoteSource.id > 0"
        :data="filterResultData"
        border
        stripe
        highlight-current-row
        @sort-change="dataSortChange"
        style="width: 100%">
        <el-table-column
            fixed
            v-for="(item, key) in sourceFields"
            v-if="!item.isHide"
            v-bind:key="key"
            :sortable="item.sortable?'custom':false"
            show-overflow-tooltip
            >
            <template slot="header">
                <span style="display: block;">{{ item.nickName }}</span>
                <span style="font-size: 10px;color:#ccc;">{{ item.name }}</span>
              </template>
              <template slot-scope="scope">
                <span style="margin-left: 4px; max-height: 100px;display: block;" v-html="renderCell(scope.row.row[item.name], item)"></span>
              </template>
        </el-table-column>
        <el-table-column
            prop="updater"
            label="最近修改人"
            width="100">
        </el-table-column>
        <el-table-column
            prop="modifyTime"
            sortable="custom"
            label="修改时间"
            width="140">
            <template slot-scope="scope">
                <span style="font-size: smaller;" v-html="renderCell(scope.row.modifyTime, {type: 'datetime'})"></span>
              </template>
        </el-table-column>
        <el-table-column
        label="操作"
        width="100">
            <template slot="header">
                <el-button type="primary" icon="el-icon-plus" circle @click="editData()"></el-button>
            </template>
            <template slot-scope="scope">
                <el-button @click="editData(scope.row)" type="text" size="small">编缉</el-button>
                <el-button type="text" @click="deleteData(scope.row)" size="small">删除</el-button>
                <el-button type="text" @click="publish(scope.row)" size="small">发布</el-button>
            </template>
        </el-table-column>
    </el-table>

    <el-pagination
      @size-change="onPageSizeChange"
      @current-change="onPageCurrentPageChange"
      :current-page="currentPage"
      :page-sizes="[10, 50, 100, 200, 300, 400, 1000]"
      :page-size="currentPageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="currentTotalCount">
    </el-pagination>

    <el-dialog
    :title="dataEditDialogTitle"
    :visible.sync="dataEditDialogVisible"
    v-if="dataEditDialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :append-to-body="true"
    fullscreen
    width="80%">
    <el-form ref="dataEditForm" :model="currentEditDataRow" label-width="200px" v-if="currentEditDataRowData">
        <el-form-item v-if="item.type != 'random'" :label="item.nickName" v-for="item in sourceFields"
        v-bind:key="item.name" :rules="{
            required: item.isRequired, message: '必填内容', trigger: 'blur'
          }">
            <el-input v-model="currentEditDataRowData[item.name]" v-if="item.type == 'text'" :maxlength="item.maxLength > 0 ? item.maxLength : 128" show-word-limit></el-input>
            <el-input type="textarea" :rows="4" placeholder="请输入内容" v-model="currentEditDataRowData[item.name]" v-if="item.type == 'content'" :maxlength="item.maxLength > 0 ? item.maxLength : 1024" show-word-limit></el-input>
            <el-input-number placeholder="请输入数字" v-model="currentEditDataRowData[item.name]" v-if="item.type == 'number'"></el-input-number>
            <el-date-picker
                v-model="currentEditDataRowData[item.name]"
                type="datetime"
                placeholder="选择日期时间" v-if="item.type == 'datetime'">
            </el-date-picker>
            <el-select v-model="currentEditDataRowData[item.name]" filterable placeholder="请选择" v-if="item.type == 'single'"
                :filter-method="(code)=>filterSelecterData(code, item, currentEditDataRowData[item.name])" clearable>
                <el-option
                    v-for="opt in item.data"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value">
                    <span style="float: left">{{ opt.label }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ opt.value }}</span>
                </el-option>
            </el-select>
            <el-select v-model="currentEditDataRowData[item.name]" filterable multiple placeholder="请选择" v-if="item.type == 'mutiple'"
                :filter-method="(code)=>filterSelecterData(code, item, currentEditDataRowData[item.name])" clearable>
                <el-option
                    v-for="opt in item.data"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value">
                    <span style="float: left">{{ opt.label }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ opt.value }}</span>
                </el-option>
            </el-select>
            <!--<el-image
                style="width: 100px; height: 100px"
                :src="currentEditDataRowData[item.name]"
                fit="fill" v-if="item.type == 'image'"></el-image>
            <el-input v-model="currentEditDataRowData[item.name]" v-if="item.type == 'image'"></el-input>-->
            <!--<el-upload
            class="avatar-uploader"
                action="#"
                accept="image/gif, image/jpeg, image/jpg, image/png, image/svg"
                v-if="item.type == 'image'"
            >
                <img v-if="currentEditDataRowData[item.name]" :src="currentEditDataRowData[item.name]" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png/gif文件，且不超过500kb</div>
            </el-upload>-->
            <ImageUploadControl v-if="item.type == 'image' || item.type == 'file'" :fileType="item.type == 'image'?'image':'other'" :imageUrl="currentEditDataRowData[item.name]"
            v-on:update:url="(url) => currentEditDataRowData[item.name]=url"></ImageUploadControl>

            <MapData v-if="item.type == 'map'" :data="currentEditDataRowData[item.name]" @dataChange="(res)=>currentEditDataRowData[item.name]=res"></MapData>

            <v-jsoneditor v-if="item.type == 'json'" v-model="currentEditDataRowData[item.name]" height="260px" :options="{mode: 'code', mainMenuBar: false, statusBar: false}" />
        </el-form-item>
        <el-form-item>
            <el-button @click="dataEditDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveData()">确 定</el-button>
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
<script lang="ts" src="./data.ts"></script>

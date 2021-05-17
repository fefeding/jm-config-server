<template>
    <div style="font-size: 24px; text-align: left">
        <el-row>
            <el-col :span="6"><div class="grid-content bg-purple">
                <el-tree
                    node-key="id"
                    highlight-current
                    :props="treeProps"
                    :data="treeRegions"
                    default-expand-all
                    @current-change="regionSelected"
                >
                <span class="custom-tree-node" slot-scope="{ node, data }">
                    <i class="el-icon-loading" v-if="data.isLoading"></i>
                    <!--<i class="el-icon-menu" v-if="data.region"></i>
                    <i class="el-icon-document" v-if="data.source"></i>-->
                    <span>{{ node.label }}</span>
                    <span>
                        <el-button
                                type="text"
                                size="small"
                                icon="el-icon-edit"
                                @click.stop="editRegionORSource(data)"
                                circle>
                        </el-button>
                        <el-dropdown
                        v-if="!!data.region"
                        trigger="click"
                        @command="(command) => addHandleCommand(command, data)">
                            <el-button
                                type="text"
                                size="small"
                                icon="el-icon-plus"
                                @click.stop
                                circle>
                            </el-button>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item
                                command="region">添加目录</el-dropdown-item>
                                <el-dropdown-item
                                command="source" v-if="!data.hasChildRegion">添加数据源</el-dropdown-item>
                                <el-dropdown-item
                                command="updateregion">修改目录</el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </span>
                </span>
                </el-tree>
            </div></el-col>
            <el-col :span="18">
                <div class="grid-content bg-purple-light">
                    <SourceDataEdit :source="currentSelectSource" v-if="currentSelectSource && currentSelectSource.id > 0"></SourceDataEdit>
                </div>
            </el-col>
          </el-row>

      <el-dialog
        :title="regionDialogTitle"
        :visible.sync="regionDialogVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        width="30%">
        <el-input v-model="editRegionName" placeholder="请输入目录名称" type="text"></el-input>
        <span slot="footer" class="dialog-footer">
            <el-button @click="regionDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveRegion()">确 定</el-button>
        </span>
        </el-dialog>

        <el-dialog
        :title="sourceDialogTitle"
        :visible.sync="sourceDialogVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :append-to-body="true"
        width="80%">
            <SourceEdit v-if="sourceDialogVisible" :sourceId="currentEditSource.id" :regionId="currentRegionId"></SourceEdit>
        </el-dialog>
    </div>
  </template>
  <style>
    .el-row {
      margin-bottom: 20px;
      &:last-child {
        margin-bottom: 0;
      }
    }
    .el-col {
      border-radius: 4px;
    }
    .bg-purple-dark {
      background: #99a9bf;
    }
    .bg-purple {
      background: #d3dce6;
    }
    .bg-purple-light {
      background: #e5e9f2;
    }
    .grid-content {
      border-radius: 4px;
      min-height: 36px;
      padding: 10px;
    }
    .row-bg {
      padding: 10px 0;
      background-color: #f9fafc;
    }
    .el-tree {
        background: none!important;
    }
    .custom-tree-node {
        flex: 0.5;
        display: flex;
        align-items:flex-start;
        justify-content: space-between;
        font-size: 16px;
        padding: 8px;
    }
  </style>
  <script type="ts" src="./index.ts"></script>

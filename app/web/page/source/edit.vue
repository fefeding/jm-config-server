<template>
    <div style="width: 80%;">
    <el-form ref="form" v-model="currentSource" label-width="80px">
        <el-form-item label="数据源key">
            <el-input v-model="currentSource.key" :disabled="sourceId > 0" minlength="4" maxlength="32" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="名称">
            <el-input v-model="currentSource.description" minlength="4" maxlength="32" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="字段">
            <el-table
                :data="computedMeta.Fields"
                border
                height="600"
                stripe
                :row-class-name="fieldRowClassName"
                style="width: 100%">
                <el-table-column
                    fixed
                    prop="name"
                    label="字段名">
                </el-table-column>
                <el-table-column
                    fixed
                    prop="nickName"
                    label="中文名">
                </el-table-column>
                <el-table-column
                prop="type"
                label="字段类型">
                    <template slot-scope="scope">
                        <span style="margin-left: 10px">{{ getFieldTypeName(scope.row.type) }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="isUnique"
                    label="是否唯一">
                    <template slot-scope="scope">
                        <span style="margin-left: 10px">{{ scope.row.isUnique?'唯一':'' }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="isRequired"
                    label="是否必选">
                    <template slot-scope="scope">
                        <span style="margin-left: 10px">{{ scope.row.isRequired?'必填':'非必填' }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="isDisabled"
                    label="编辑禁用">
                    <template slot-scope="scope">
                        <span style="margin-left: 10px">{{ scope.row.isDisabled ? '禁用' : '不禁用' }}</span>
                    </template>
                </el-table-column>
                <!-- <el-table-column
                    prop="sort"
                    label="排序">
                    <template slot-scope="scope">
                        <span style="margin-left: 10px">{{ scope.row.sortable?'支持':'不支持' }}</span>
                    </template>
                </el-table-column> -->
                <el-table-column
                    label="操作"
                    align="center"
                    width="170">
                    <template slot="header">
                        <el-button type="primary" icon="el-icon-plus" circle @click="editField()"></el-button>
                    </template>
                    <template slot-scope="scope">
                        <el-button @click="editField(scope.row)" type="text" size="small">编缉</el-button>
                        <el-button type="text" size="small" @click="deleteField(scope.row)">删除</el-button>
                        <el-button type="text" size="small" v-if="scope.$index !== 0" @click="upperField(scope.$index)">上移</el-button>
                        <el-button type="text" size="small" v-if="scope.$index !== computedMeta.Fields.length-1"  @click="downField(scope.$index)">下移</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-form-item>
        <el-form-item label="发布脚本">
            <el-button type="primary" icon="el-icon-edit" @click="()=>{currentPublishScript=currentSource.publishScript;publishScriptDialogVisible=true}"></el-button>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="save">保存</el-button>
        </el-form-item>
  </el-form>
  <el-dialog
  :title="fieldDialogTitle"
  :visible.sync="fieldDialogVisible"
  :close-on-click-modal="false"
  :close-on-press-escape="false"
  :append-to-body="true"
  width="60%">
  <el-form ref="fieldForm" :model="currentField" label-width="80px">
    <el-form-item label="字段名">
      <el-input v-model="currentField.name" minlength="4" maxlength="32" :disabled="currentFieldFlag === 1"  show-word-limit></el-input>
    </el-form-item>
    <el-form-item label="中文名">
        <el-input v-model="currentField.nickName" minlength="1" maxlength="32" show-word-limit></el-input>
      </el-form-item>
      <el-form-item label="默认值">
          <el-input v-model="currentField.default" minlength="0" maxlength="1024" show-word-limit></el-input>
        </el-form-item>
    <el-form-item label="字段类型">
        <el-col :span="10">
            <el-select v-model="currentField.type" placeholder="请选择">
                <el-option
                v-for="item in fieldTypeMap"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                </el-option>
            </el-select>
        </el-col>
        <el-col class="line" :span="2" v-if="currentField.type == 'single' || currentField.type == 'mutiple'">选项数据来源</el-col>
        <el-col :span="12" v-if="currentField.type == 'single' || currentField.type == 'mutiple'">
            <el-select v-model="currentField.dataChannel" placeholder="请选择">
                <el-option
                label="手动配置"
                value="config">
                </el-option>
                <el-option
                label="数据源"
                value="source">
                </el-option>
                <el-option
                label="脚本配置"
                value="script">
                </el-option>
            </el-select>
        </el-col>
    </el-form-item>
    <el-form-item label="选项数据" v-if="(currentField.type == 'single' || currentField.type == 'mutiple') && currentField.dataChannel == 'config'">
        <v-jsoneditor v-model="currentFieldDataString" height="260px" :options="{mode: 'code', mainMenuBar: false, statusBar: false}" />
        <!--<el-input
            type="textarea"
            :rows="2"
            placeholder="请输入内容"
            :autosize="{ minRows: 5, maxRows: 10 }"
            v-model="currentFieldDataString">
        </el-input>-->
    </el-form-item>
    <el-form-item label="数据配置" v-if="(currentField.type == 'single' || currentField.type == 'mutiple') && currentField.dataChannel == 'source'">
        <el-col :span="8">
            <el-select
            v-model="currentFieldDataSource.sourceId"
            filterable
            :filter-method="sourceFilterMethod"
            placeholder="请选择数据源">
            <el-option
                v-for="item in currentSourceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                <span style="float: left">{{ item.label }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.key }}</span>
                </el-option>
            </el-select>
        </el-col>
        <el-col class="line" :span="2">关健值</el-col>
        <el-col :span="6">
            <el-select
            v-model="currentFieldDataSource.value"
            filterable
            placeholder="请选择关健字段">
            <el-option
                v-for="item in computedCurrentSourceFields"
                :key="item.name"
                :label="item.nickName"
                :value="item.name">
                </el-option>
            </el-select>
        </el-col>
        <el-col class="line" :span="2">显示字段</el-col>
        <el-col :span="6">
            <el-select
            v-model="currentFieldDataSource.label"
            filterable
            placeholder="请选择显示字段">
            <el-option
                v-for="item in computedCurrentSourceFields"
                :key="item.name"
                :label="item.nickName"
                :value="item.name">
                </el-option>
            </el-select>
        </el-col>
    </el-form-item>
    <el-form-item label="配置脚本" v-if="(currentField.type == 'single' || currentField.type == 'mutiple') && currentField.dataChannel == 'script'">
        <codemirror v-model="currentField.sourceConfig" :options="codeJSONOptions" style="height: 500px;" />
      </el-form-item>
    <el-form-item label="最大长度" v-if="currentField.type == 'text' || currentField.type == 'content'">
        <el-input-number v-model="currentField.maxLength"></el-input-number>
    </el-form-item>
    <el-form-item label="">
        <el-checkbox v-model="currentField.isRequired">字段必选</el-checkbox>
        <el-checkbox v-model="currentField.isUnique">唯一健</el-checkbox>
        <el-checkbox v-model="currentField.isHide">数据列表中隐藏列</el-checkbox>
        <el-checkbox v-model="currentField.sortable">支持排序</el-checkbox>
        <el-checkbox v-model="currentField.isDisabled">编辑禁用</el-checkbox>
      </el-form-item>

      <el-form-item label="检索">
        <el-radio-group v-model="currentField.searchType">
            <el-radio :label="0" checked>无检索</el-radio>
            <el-radio :label="1">全匹配(=)</el-radio>
            <el-radio :label="2">右模糊(...%)</el-radio>
            <el-radio :label="3">左模糊(%...)</el-radio>
            <el-radio :label="4">全模糊(%...%)</el-radio>
          </el-radio-group>
      </el-form-item>
    <el-form-item>
        <el-button @click="fieldDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="saveField()">确 定</el-button>
    </el-form-item>
  </el-form>
  </el-dialog>
  <el-dialog
  title="发布脚本"
  :visible.sync="publishScriptDialogVisible"
  :close-on-click-modal="false"
  :close-on-press-escape="false"
  :append-to-body="true"
  width="80%"
  fullscreen>
  <el-form label-width="0" style="width: 100%; height: 100%;">
    <el-form-item label="">
        <codemirror v-model="currentPublishScript" :options="codeJSONOptions" style="height: 800px;" />
        <a href="https://git.code.oa.com/G-JV/jv-platform-projects/blob/master/app-base/jv-config-server/docs/%E5%8F%91%E5%B8%83%E8%84%9A%E6%9C%AC%E9%85%8D%E7%BD%AE.md" target="_blank">脚本教程</a>
      </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="savePublishScript">确 定</el-button>
    </el-form-item>
  </el-form>
  </el-dialog>
</div>
</template>
<style>
.el-table .unique-row {
    background: #f0f9eb;
}
.vue-codemirror {
    text-align: left;
    line-height: 22px;
    font-size: 14px;
}
.CodeMirror-wrap {
    height: 100%;
}

.jsoneditor{
    border: 1px solid #ccc;
}
</style>
<script lang="ts" src="./edit.ts"></script>

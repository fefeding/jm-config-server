<template>
<div style="min-width: 95%;">
    <el-row>
        <el-form>
            <el-form-item label="二维码类型">
                <el-select v-model="action_name" placeholder="请选择类型">
                    <el-option
                        v-for="opt in actions"
                        :key="opt.action"
                        :label="opt.name"
                        :value="opt.action">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="有效时间(秒)" v-if="action_name=='QR_STR_SCENE' || action_name=='QR_SCENE'">
                <el-input-number placeholder="该二维码有效时间，以秒为单位。 最大不超过2592000（即30天）" v-model="expire_seconds" ></el-input-number>
            </el-form-item>
            <el-form-item label="渠道id（由数据产品提供）">
                <el-input v-model="scene_str" maxlength="64" show-word-limit></el-input>
            </el-form-item>
            <el-form-item label="渠道描述">
                <el-input v-model="scene_description" maxlength="128" show-word-limit></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="createQRCode()" >生成</el-button>
            </el-form-item>
        </el-form>
    </el-row>
    <el-row>
        {{ resultStr }}
    </el-row>
    <el-table
      :data="qrcodeData"
      style="width: 100%">
      <el-table-column
        prop="actionName"
        label="类型"
        width="100">
        <template slot-scope="scope">
          {{ getActionName(scope.row.actionName) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="actionInfo"
        label="渠道"
        width="100">
        <template slot-scope="scope">
         {{ scope.row.actionInfo.scene?(scope.row.actionInfo.scene.scene_id||scope.row.actionInfo.scene.scene_str):(scope.row.actionInfo.scene_id||scope.row.actionInfo.scene_str)}}        
      </template>
      </el-table-column>
      <el-table-column
        prop="actionInfo.scene_description"
        label="渠道描述"
        width="120">
      </el-table-column>
      <el-table-column
        prop="ticket"
        label="二维码"
        width="150">
      <template slot-scope="scope">
        <a :href="'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket='+scope.row.ticket" target="_blank">
            <img :src="'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket='+scope.row.ticket" style="max-height:60px;" />
        </a>        
      </template>
      </el-table-column>
      <el-table-column
        prop="expireSeconds"
        label="有效期(秒)">
      </el-table-column>
      <el-table-column
        prop="url"
        label="url">
        <template slot-scope="scope">
          {{'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket='+scope.row.ticket}}
      </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="生成时间">
        
            <template slot-scope="scope">
                <span style="font-size: smaller;" v-html="renderDate(scope.row.createTime)"></span>
              </template>
      </el-table-column>
    </el-table>
</div>
</template>
<script lang="ts" src="./wxQRCode.ts"></script>

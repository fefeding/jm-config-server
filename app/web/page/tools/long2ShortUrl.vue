<template>
<div style="min-width: 95%;">
    <el-row>
        <el-form>
            <el-form-item label="长链接">
                <el-input v-model="longUrl" placeholder="请输入长链接"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="convertUrl()" >转换</el-button>
            </el-form-item>
        </el-form>
    </el-row>
    <el-row>
        {{ shortUrl || errorMsg }}
    </el-row>
</div>
</template>
<script lang="ts" src="./long2ShortUrl.ts"></script>

<template>
    <el-upload
        class="jv-config-uploader"
        action="#"
        :disabled="disabled"
        :on-success="onUploadSuccess"
        :on-progress="onUploadProgress"
        :http-request="onUploadFile"
        :on-error="onUploadError"
        :file-list="fileList"
        :list-type="fileType=='image'?'picture':'text'"
        accept="*/*">
        <el-button size="small" type="primary">点击上传</el-button>
    </el-upload>
</template>
<style>
.jv-config-uploader {
    width: 360px;
}
.jv-config-uploader .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden
}

.jv-config-uploader .avatar-uploader .el-upload:focus,.jv-config-uploader .avatar-uploader .el-upload:hover {
    border-color: #409eff
}

.jv-config-uploader .avatar-uploader .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center
}

.jv-config-uploader .avatar-uploader .avatar {
    width: 178px;
    height: 178px;
    display: block
}
</style>
<script lang="ts" src="./imageUpload.ts"></script>

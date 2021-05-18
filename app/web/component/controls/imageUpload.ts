/**
 * 文件上传组件，支持事件 onError, onSuccess
 */

import { Vue, Prop, Component, Watch } from 'vue-property-decorator';
import {
    SourceUploadImageReq, SourceUploadImageRsp } from '../../../model/interface/sourceData';

@Component
export default class ImageUpload extends Vue {
    private __imageUrl = ''; // 当前URL

    private fileList = new Array<{
        name?: string,
        url?: string
    }>();

    /**
     * 是否禁用 true=禁用
     */
    @Prop()
    private disabled?: boolean;

    /**
     * 是否禁用 true=禁用
     */
    @Prop()
    private fileType?: 'image' | 'pdf' | 'other' | 'js';

    /**
     * 图片url
     */
    @Prop()
    private imageUrl?: string;

    @Watch('imageUrl')
    bindImage() {
        this.fileList = [{
            name: this.imageUrl||'',
            url: this.imageUrl
        }];
    }

    mounted () {
        this.fileList = new Array<{
            name?: string,
            url?: string
        }>();

        this.imageUrl && this.fileList.push({
            name: this.imageUrl||'',
            url: this.imageUrl
        });
    }


    // 自定义上传
    async onUploadFile(f) {

        const req = new FormData();
        req.append('file', f.file);

        const contentType = f.file.type;
        const filename = f.file.name;

        const loading = this.$loading({
            lock: true,
            text: '上传中...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
        });
        //@ts-ignore
        const rsp = await this.$ajax.requestApi<SourceUploadImageReq, SourceUploadImageRsp>(req, {
            method: 'post',
            url: '/api/source/upload?fileType=' +this.fileType + `&contentType=${contentType}&filename=${filename}`,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        loading.close();

        if(rsp.ret == 0) {
            // @ts-ignore
            this.__imageUrl = rsp.data.url;
            console.log(rsp);

            // 用事件通知url发生改变
            this.$emit('update:url', this.__imageUrl);

            return true;
        }
        else {
            this.$message.error('上传失败');
            return false;
        }
    }

    onUploadSuccess() {
    }

    onUploadProgress() {

    }

    onUploadError() {
        this.$emit('onUploadError', this.__imageUrl);
    }
}

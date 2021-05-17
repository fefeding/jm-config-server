import { Vue, Component, Prop, Watch } from 'vue-property-decorator';


@Component({
    components: {
        
    }
})
export default class ShortUrlPage extends Vue {

    longUrl = "";

    shortUrl = "";

    errorMsg = "";

    async convertUrl() {
        if(!this.longUrl) {
            alert('请输入正确的长链接');
            return false;
        }
        this.shortUrl = "";
        this.errorMsg = "";

        const res = await this.$ajax.requestApi<any, any>({
            url: this.longUrl
        }, {
            url: '/api/tool/long2ShortUrl'
        });
        console.log(res);

        if(!res || res.ret !== 0 || res.data.errcode != 0) {
            this.errorMsg = res.msg + res.data.errmsg;
        }
        else {
            this.shortUrl = res.data.short_url;
        }

    }

    mounted () {

    }

}

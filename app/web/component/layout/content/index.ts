import { Vue, Component } from 'vue-property-decorator';
@Component
export default class Content extends Vue {

    // 菜单收缩标记
    get collapse(): boolean {
        return this.$store.state?this.$store.state.collapse:false;
    }
    set collapse(v) {
        if(this.$store.state) this.$store.state.collapse = v;
    }
}

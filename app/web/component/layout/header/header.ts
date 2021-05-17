import './header.css';
import LeftMenu from '../menu/menu.vue';
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
    components: {
        LeftMenu
    }
})
export default class Header extends Vue {
    // 菜单收缩标记
    get collapse(): boolean {
        return this.$store.state?this.$store.state.collapse:false;
    }
    set collapse(v) {
        if(this.$store.state) this.$store.state.collapse = v;
    }

    // 当前登录用户
    get loginUser() {
        return this.$store.state.loginUser || {};
    }
    site: any = {
        name: this.$store.state.title || ''
    };
    logout() {
        window.location.replace('/account/login/logout?url=' + encodeURIComponent(location.href));
    }
}

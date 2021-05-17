'use strict';
import { Vue, Component } from 'vue-property-decorator';

@Component({
    components: {
    }
})
export default class Dashboard extends Vue {

    codeJSONOptions = {
        tabSize: 4,
        mode: {
            name: 'javascript',
            json: true
        },
        theme: 'default',
        //lineNumbers: true,
        line: true,
    };
    async mounted(): Promise<void> {

    }
}

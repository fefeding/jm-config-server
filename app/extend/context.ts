'use strict';
import { Context } from 'egg';


export default {
    // 是否是管理员
    isManager: function (this: Context) {
        try {
            return true;
            // @ts-ignore
            if(!this.currentSession || !this.app.config.managers.users.includes(this.currentSession.user.staffId)) {
                return false;
            }
            return true;
        }
        catch(e) {
            console.log(e);
            return false;
        }
    }
};

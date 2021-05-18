import req from "./request";
import rsp from "./response";

export class GetUserInfoReq extends req {
    loginId?: string;
    accountId?: string;
    uid?: string;
    telNo?: string;
    idNo?: string;
}

export class GetUserInfoRes extends rsp {
    data?: {
        loginId?: string;        
    }
}
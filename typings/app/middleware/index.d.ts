// This file is created by egg-ts-helper@1.35.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportAccess from '../../../app/middleware/access';
import ExportApi from '../../../app/middleware/api';
import ExportGlobal from '../../../app/middleware/global';

declare module 'egg' {
  interface IMiddleware {
    access: typeof ExportAccess;
    api: typeof ExportApi;
    global: typeof ExportGlobal;
  }
}

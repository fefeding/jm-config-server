// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportActionLog from '../../../app/model/actionLog';
import ExportPublishLog from '../../../app/model/publishLog';
import ExportSource from '../../../app/model/source';
import ExportSourceData from '../../../app/model/sourceData';
import ExportSourceRegion from '../../../app/model/sourceRegion';
import ExportUploadFileLog from '../../../app/model/uploadFileLog';
import ExportWxQRCode from '../../../app/model/wxQRCode';

declare module 'egg' {
  interface IModel {
    ActionLog: ReturnType<typeof ExportActionLog>;
    PublishLog: ReturnType<typeof ExportPublishLog>;
    Source: ReturnType<typeof ExportSource>;
    SourceData: ReturnType<typeof ExportSourceData>;
    SourceRegion: ReturnType<typeof ExportSourceRegion>;
    UploadFileLog: ReturnType<typeof ExportUploadFileLog>;
    WxQRCode: ReturnType<typeof ExportWxQRCode>;
  }
}

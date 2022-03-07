// This file is created by egg-ts-helper@1.30.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportActionLog from '../../../app/model/actionLog';
import ExportBaseORM from '../../../app/model/baseORM';
import ExportPublishLog from '../../../app/model/publishLog';
import ExportSource from '../../../app/model/source';
import ExportSourceData from '../../../app/model/sourceData';
import ExportSourceRegion from '../../../app/model/sourceRegion';
import ExportUploadFileLog from '../../../app/model/uploadFileLog';
import ExportInterfaceCos from '../../../app/model/interface/cos';
import ExportInterfaceEnumType from '../../../app/model/interface/enumType';
import ExportInterfaceModel from '../../../app/model/interface/model';
import ExportInterfacePagination from '../../../app/model/interface/pagination';
import ExportInterfacePublishLog from '../../../app/model/interface/publishLog';
import ExportInterfaceRequest from '../../../app/model/interface/request';
import ExportInterfaceResponse from '../../../app/model/interface/response';
import ExportInterfaceSourceData from '../../../app/model/interface/sourceData';
import ExportInterfaceSourceRegion from '../../../app/model/interface/sourceRegion';
import ExportInterfaceTools from '../../../app/model/interface/tools';

declare module 'egg' {
  interface IModel {
    ActionLog: ReturnType<typeof ExportActionLog>;
    BaseORM: ReturnType<typeof ExportBaseORM>;
    PublishLog: ReturnType<typeof ExportPublishLog>;
    Source: ReturnType<typeof ExportSource>;
    SourceData: ReturnType<typeof ExportSourceData>;
    SourceRegion: ReturnType<typeof ExportSourceRegion>;
    UploadFileLog: ReturnType<typeof ExportUploadFileLog>;
    Interface: {
      Cos: ReturnType<typeof ExportInterfaceCos>;
      EnumType: ReturnType<typeof ExportInterfaceEnumType>;
      Model: ReturnType<typeof ExportInterfaceModel>;
      Pagination: ReturnType<typeof ExportInterfacePagination>;
      PublishLog: ReturnType<typeof ExportInterfacePublishLog>;
      Request: ReturnType<typeof ExportInterfaceRequest>;
      Response: ReturnType<typeof ExportInterfaceResponse>;
      SourceData: ReturnType<typeof ExportInterfaceSourceData>;
      SourceRegion: ReturnType<typeof ExportInterfaceSourceRegion>;
      Tools: ReturnType<typeof ExportInterfaceTools>;
    }
  }
}

// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportActionLog from '../../../app/service/actionLog';
import ExportBase from '../../../app/service/base';
import ExportCos from '../../../app/service/cos';
import ExportPublish from '../../../app/service/publish';
import ExportSource from '../../../app/service/source';
import ExportSourceData from '../../../app/service/sourceData';
import ExportSourceRegion from '../../../app/service/sourceRegion';
import ExportUpload from '../../../app/service/upload';

declare module 'egg' {
  interface IService {
    actionLog: AutoInstanceType<typeof ExportActionLog>;
    base: AutoInstanceType<typeof ExportBase>;
    cos: AutoInstanceType<typeof ExportCos>;
    publish: AutoInstanceType<typeof ExportPublish>;
    source: AutoInstanceType<typeof ExportSource>;
    sourceData: AutoInstanceType<typeof ExportSourceData>;
    sourceRegion: AutoInstanceType<typeof ExportSourceRegion>;
    upload: AutoInstanceType<typeof ExportUpload>;
  }
}

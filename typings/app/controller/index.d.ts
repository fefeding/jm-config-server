// This file is created by egg-ts-helper@1.30.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportActionLog from '../../../app/controller/actionLog';
import ExportIndex from '../../../app/controller/index';
import ExportRegion from '../../../app/controller/region';
import ExportSource from '../../../app/controller/source';

declare module 'egg' {
  interface IController {
    actionLog: ExportActionLog;
    index: ExportIndex;
    region: ExportRegion;
    source: ExportSource;
  }
}

// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAct from '../../../app/controller/act';
import ExportActionLog from '../../../app/controller/actionLog';
import ExportIndex from '../../../app/controller/index';
import ExportRegion from '../../../app/controller/region';
import ExportSource from '../../../app/controller/source';
import ExportTool from '../../../app/controller/tool';
import ExportWhiteConfig from '../../../app/controller/whiteConfig';

declare module 'egg' {
  interface IController {
    act: ExportAct;
    actionLog: ExportActionLog;
    index: ExportIndex;
    region: ExportRegion;
    source: ExportSource;
    tool: ExportTool;
    whiteConfig: ExportWhiteConfig;
  }
}

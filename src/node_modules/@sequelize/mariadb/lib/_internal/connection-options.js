"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var connection_options_exports = {};
__export(connection_options_exports, {
  BOOLEAN_CONNECTION_OPTION_NAMES: () => BOOLEAN_CONNECTION_OPTION_NAMES,
  CONNECTION_OPTION_NAMES: () => CONNECTION_OPTION_NAMES,
  NUMBER_CONNECTION_OPTION_NAMES: () => NUMBER_CONNECTION_OPTION_NAMES,
  STRING_CONNECTION_OPTION_NAMES: () => STRING_CONNECTION_OPTION_NAMES
});
module.exports = __toCommonJS(connection_options_exports);
var import_utils = require("@sequelize/utils");
const STRING_CONNECTION_OPTION_MAP = {
  cachingRsaPublicKey: void 0,
  charset: void 0,
  collation: void 0,
  database: void 0,
  host: void 0,
  initSql: void 0,
  password: void 0,
  rsaPublicKey: void 0,
  socketPath: void 0,
  user: void 0
};
const STRING_CONNECTION_OPTION_NAMES = (0, import_utils.getSynchronizedTypeKeys)(
  STRING_CONNECTION_OPTION_MAP
);
const BOOLEAN_CONNECTION_OPTION_MAP = {
  debug: void 0,
  debugCompress: void 0,
  // TODO: https://github.com/sequelize/sequelize/issues/11832 - replace with a unified "logging" option
  logParam: void 0,
  trace: void 0,
  multipleStatements: void 0,
  ssl: void 0,
  compress: void 0,
  logPackets: void 0,
  forceVersionCheck: void 0,
  foundRows: void 0,
  allowPublicKeyRetrieval: void 0,
  metaEnumerable: void 0,
  bulk: void 0,
  pipelining: void 0,
  permitLocalInfile: void 0,
  checkDuplicate: void 0
};
const BOOLEAN_CONNECTION_OPTION_NAMES = (0, import_utils.getSynchronizedTypeKeys)(
  BOOLEAN_CONNECTION_OPTION_MAP
);
const NUMBER_CONNECTION_OPTION_MAP = {
  port: void 0,
  connectTimeout: void 0,
  socketTimeout: void 0,
  debugLen: void 0,
  maxAllowedPacket: void 0,
  keepAliveDelay: void 0,
  prepareCacheLength: void 0,
  queryTimeout: void 0
};
const NUMBER_CONNECTION_OPTION_NAMES = (0, import_utils.getSynchronizedTypeKeys)(
  NUMBER_CONNECTION_OPTION_MAP
);
const CONNECTION_OPTION_NAMES = (0, import_utils.getSynchronizedTypeKeys)({
  ...STRING_CONNECTION_OPTION_MAP,
  ...BOOLEAN_CONNECTION_OPTION_MAP,
  ...NUMBER_CONNECTION_OPTION_MAP,
  connectAttributes: void 0,
  infileStreamFactory: void 0,
  // TODO: https://github.com/sequelize/sequelize/issues/11832 - replace with a unified "logging" option
  logger: void 0,
  sessionVariables: void 0,
  stream: void 0
});
//# sourceMappingURL=connection-options.js.map

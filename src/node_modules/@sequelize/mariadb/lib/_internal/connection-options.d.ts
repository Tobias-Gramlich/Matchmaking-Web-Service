import type { MariaDbConnectionOptions } from '../connection-manager.js';
export declare const STRING_CONNECTION_OPTION_NAMES: readonly ("host" | "user" | "collation" | "charset" | "socketPath" | "initSql" | "rsaPublicKey" | "cachingRsaPublicKey" | "database" | "password")[];
export declare const BOOLEAN_CONNECTION_OPTION_NAMES: readonly ("bulk" | "pipelining" | "forceVersionCheck" | "permitLocalInfile" | "checkDuplicate" | "debug" | "debugCompress" | "logParam" | "trace" | "multipleStatements" | "ssl" | "compress" | "logPackets" | "foundRows" | "allowPublicKeyRetrieval" | "metaEnumerable")[];
export declare const NUMBER_CONNECTION_OPTION_NAMES: readonly ("port" | "connectTimeout" | "socketTimeout" | "queryTimeout" | "debugLen" | "maxAllowedPacket" | "keepAliveDelay" | "prepareCacheLength")[];
export declare const CONNECTION_OPTION_NAMES: readonly (keyof MariaDbConnectionOptions)[];

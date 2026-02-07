import type { AbstractConnection, ConnectionOptions } from '@sequelize/core';
import { AbstractConnectionManager } from '@sequelize/core';
import * as MariaDb from 'mariadb';
import type { MariaDbDialect } from './dialect.js';
export type MariaDbModule = typeof MariaDb;
export interface MariaDbConnection extends AbstractConnection, MariaDb.Connection {
}
export interface MariaDbConnectionOptions extends Omit<MariaDb.ConnectionConfig, 'typeCast' | 'timezone' | 'namedPlaceholders' | 'arrayParenthesis' | 'insertIdAsNumber' | 'metaAsArray' | 'rowsAsArray' | 'nestTables' | 'dateStrings' | 'decimalAsNumber' | 'bigIntAsNumber' | 'supportBigNumbers' | 'bigNumberStrings' | 'autoJsonMap' | 'checkNumberRange' | 'permitSetMultiParamEntries'> {
}
/**
 * MariaDB Connection Manager
 *
 * Get connections, validate and disconnect them.
 * AbstractConnectionManager pooling use it to handle MariaDB specific connections
 * Use https://github.com/MariaDB/mariadb-connector-nodejs to connect with MariaDB server
 */
export declare class MariaDbConnectionManager extends AbstractConnectionManager<MariaDbDialect, MariaDbConnection> {
    #private;
    constructor(dialect: MariaDbDialect);
    /**
     * Connect with MariaDB database based on config, Handle any errors in connection
     * Set the pool handlers on connection.error
     * Also set proper timezone once connection is connected.
     *
     * @param config
     */
    connect(config: ConnectionOptions<MariaDbDialect>): Promise<MariaDbConnection>;
    disconnect(connection: MariaDbConnection): Promise<void>;
    validate(connection: MariaDbConnection): boolean;
}

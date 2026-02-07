import type { Sequelize } from '@sequelize/core';
import { AbstractDialect } from '@sequelize/core';
import type { MariaDbConnectionOptions, MariaDbModule } from './connection-manager.js';
import { MariaDbConnectionManager } from './connection-manager.js';
import { MariaDbQueryGenerator } from './query-generator.js';
import { MariaDbQueryInterface } from './query-interface.js';
import { MariaDbQuery } from './query.js';
export interface MariaDbDialectOptions {
    /**
     * The mariadb library to use.
     * If not provided, the mariadb npm library will be used.
     * Must be compatible with the mariadb npm library API.
     *
     * Using this option should only be considered as a last resort,
     * as the Sequelize team cannot guarantee its compatibility.
     */
    mariaDbModule?: MariaDbModule;
    /**
     * Show warnings if there are any when executing a query
     */
    showWarnings?: boolean | undefined;
}
export declare class MariaDbDialect extends AbstractDialect<MariaDbDialectOptions, MariaDbConnectionOptions> {
    static supports: import("@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/dialect.js").DialectSupports;
    readonly queryGenerator: MariaDbQueryGenerator;
    readonly connectionManager: MariaDbConnectionManager;
    readonly queryInterface: MariaDbQueryInterface;
    readonly Query: typeof MariaDbQuery;
    constructor(sequelize: Sequelize, options: MariaDbDialectOptions);
    createBindCollector(): import("@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/dialect.js").BindCollector;
    escapeString(value: string): string;
    canBackslashEscape(): boolean;
    getDefaultSchema(): string;
    parseConnectionUrl(url: string): MariaDbConnectionOptions;
    static getSupportedOptions(): readonly (keyof MariaDbDialectOptions)[];
    static getSupportedConnectionOptions(): readonly (keyof MariaDbConnectionOptions)[];
}

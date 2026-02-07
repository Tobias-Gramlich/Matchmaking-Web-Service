import { AbstractQueryGeneratorInternal } from '@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/query-generator-internal.js';
import type { AddLimitOffsetOptions } from '@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/query-generator.internal-types.js';
import type { MariaDbDialect } from './dialect.js';
export declare class MariaDbQueryGeneratorInternal<Dialect extends MariaDbDialect = MariaDbDialect> extends AbstractQueryGeneratorInternal<Dialect> {
    getTechnicalSchemaNames(): readonly string[];
    addLimitAndOffset(options: AddLimitOffsetOptions): string;
}

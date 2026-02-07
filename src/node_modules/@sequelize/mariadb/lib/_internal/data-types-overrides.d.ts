import type { BindParamOptions, GeoJson } from '@sequelize/core';
import type { AcceptedDate } from '@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/data-types.js';
import * as BaseTypes from '@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/data-types.js';
export declare class FLOAT extends BaseTypes.FLOAT {
    protected getNumberSqlTypeName(): string;
}
export declare class BOOLEAN extends BaseTypes.BOOLEAN {
    toSql(): string;
    toBindableValue(value: boolean | unknown): unknown;
}
export declare class DATE extends BaseTypes.DATE {
    toBindableValue(date: AcceptedDate): string;
    sanitize(value: unknown, options?: {
        timezone?: string;
    }): unknown;
}
export declare class UUID extends BaseTypes.UUID {
    toSql(): string;
}
export declare class GEOMETRY extends BaseTypes.GEOMETRY {
    toBindableValue(value: GeoJson): string;
    getBindParamSql(value: GeoJson, options: BindParamOptions): string;
    toSql(): string;
}
export declare class ENUM<Member extends string> extends BaseTypes.ENUM<Member> {
    toSql(): string;
}

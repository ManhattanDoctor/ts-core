import Decimal from 'decimal.js';
import * as _ from 'lodash';

export class MathUtil {
    // --------------------------------------------------------------------------
    //
    // 	Private Static Mehods
    //
    // --------------------------------------------------------------------------

    private static _config: MathUtilConfig = { defaults: true };

    // --------------------------------------------------------------------------
    //
    // 	Static Properties
    //
    // --------------------------------------------------------------------------

    public static get config(): MathUtilConfig {
        return MathUtil._config;
    }

    public static set config(value: MathUtilConfig) {
        if (value === MathUtil._config) {
            return;
        }
        Decimal.set(value);
        MathUtil._config = value;
    }

    public static create(): Decimal.Constructor {
        return Decimal.set(MathUtil.config || { defaults: true });
    }

    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static add(first: string, second: string): string {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            return null;
        }
        let constructor = MathUtil.create();
        return MathUtil.toString(new constructor(first).add(new constructor(second)));
    }

    public static subtract(first: string, second: string): string {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            return null;
        }
        let constructor = MathUtil.create();
        return MathUtil.toString(new constructor(first).sub(new constructor(second)));
    }

    public static multiply(first: string, second: string): string {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            return null;
        }
        let constructor = MathUtil.create();
        return MathUtil.toString(new constructor(first).mul(new constructor(second)));
    }

    public static divide(first: string, second: string): string {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            return null;
        }
        let constructor = MathUtil.create();
        return MathUtil.toString(new constructor(first).dividedBy(new constructor(second)));
    }

    public static ceil(value: string): string {
        if (MathUtil.isInvalid(value)) {
            return null;
        }
        let constructor = MathUtil.create();
        return MathUtil.toString(new constructor(value).ceil());
    }

    public static floor(value: string): string {
        if (MathUtil.isInvalid(value)) {
            return null;
        }
        let constructor = MathUtil.create();
        return MathUtil.toString(new constructor(value).floor());
    }

    public static toString(value: Decimal.Value): string {
        if (MathUtil.isInvalid(value)) {
            return null;
        }
        return value.toString();
    }

    public static toNumber(value: Decimal.Value): number {
        if (MathUtil.isInvalid(value)) {
            return null;
        }
        let constructor = MathUtil.create();
        return new constructor(value).toNumber();
    }

    public static toHex(value: Decimal.Value): string {
        if (MathUtil.isInvalid(value)) {
            return null;
        }
        let constructor = MathUtil.create();
        return new constructor(value).toHex();
    }

    public static isInvalid(value: Decimal.Value): boolean {
        return _.isNil(value);
    }

    // --------------------------------------------------------------------------
    //
    // 	Math Methods
    //
    // --------------------------------------------------------------------------

    public static max(first: string, second: string): string {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            return null;
        }
        return MathUtil.greaterThanOrEqualTo(first, second) ? MathUtil.toString(first) : MathUtil.toString(second);
    }

    public static min(first: string, second: string): string {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            return null;
        }
        return MathUtil.lessThanOrEqualTo(first, second) ? MathUtil.toString(first) : MathUtil.toString(second);
    }

    public static abs(value: string): string {
        if (MathUtil.isInvalid(value)) {
            return null;
        }
        let constructor = MathUtil.create();
        return MathUtil.toString(new constructor(value).abs());
    }

    // --------------------------------------------------------------------------
    //
    // 	Compare Methods
    //
    // --------------------------------------------------------------------------

    public static lessThan(first: string, second: string): boolean {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            throw new Error(`Invalid arguments`);
        }
        let constructor = MathUtil.create();
        return new constructor(first).lessThan(new constructor(second));
    }

    public static lessThanOrEqualTo(first: string, second: string): boolean {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            throw new Error(`Invalid arguments`);
        }
        let constructor = MathUtil.create();
        return new constructor(first).lessThanOrEqualTo(new constructor(second));
    }

    public static greaterThan(first: string, second: string): boolean {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            throw new Error(`Invalid arguments`);
        }
        let constructor = MathUtil.create();
        return new constructor(first).greaterThan(new constructor(second));
    }

    public static greaterThanOrEqualTo(first: string, second: string): boolean {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            throw new Error(`Invalid arguments`);
        }
        let constructor = MathUtil.create();
        return new constructor(first).greaterThanOrEqualTo(new constructor(second));
    }

    public static equals(first: string, second: string): boolean {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            throw new Error(`Invalid arguments`);
        }
        let constructor = MathUtil.create();
        return new constructor(first).equals(new constructor(second));
    }
}

export type MathUtilConfig = Decimal.Config;

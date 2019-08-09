import Decimal from 'decimal.js';
import * as _ from 'lodash';

export class MathUtil {
    // --------------------------------------------------------------------------
    //
    // 	Basic Methods
    //
    // --------------------------------------------------------------------------

    public static add(first: string, second: string): string {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            return null;
        }
        return MathUtil.toString(new Decimal(first).add(new Decimal(second)));
    }

    public static subtract(first: string, second: string): string {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            return null;
        }
        return MathUtil.toString(new Decimal(first).sub(new Decimal(second)));
    }

    public static multiply(first: string, second: string): string {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            return null;
        }
        return MathUtil.toString(new Decimal(first).mul(new Decimal(second)));
    }

    public static divide(first: string, second: string): string {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            return null;
        }
        return MathUtil.toString(new Decimal(first).dividedBy(new Decimal(second)));
    }

    public static floor(value: string): string {
        if (MathUtil.isInvalid(value)) {
            return null;
        }
        return MathUtil.toString(new Decimal(value).floor());
    }

    public static toString(value: Decimal.Value): string {
        let constructor = Decimal.set({ toExpNeg: -20 });
        if (MathUtil.isInvalid(value)) {
            return null;
        }
        return new constructor(value).valueOf();
    }

    public static toNumber(value: Decimal.Value): number {
        if (MathUtil.isInvalid(value)) {
            return null;
        }
        return new Decimal(value).toNumber();
    }

    public static toHex(value: Decimal.Value): string {
        if (MathUtil.isInvalid(value)) {
            return null;
        }
        return new Decimal(value).toHex();
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
        return MathUtil.toString(new Decimal(value).abs());
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
        return new Decimal(first).lessThan(new Decimal(second));
    }

    public static lessThanOrEqualTo(first: string, second: string): boolean {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            throw new Error(`Invalid arguments`);
        }
        return new Decimal(first).lessThanOrEqualTo(new Decimal(second));
    }

    public static greaterThan(first: string, second: string): boolean {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            throw new Error(`Invalid arguments`);
        }
        return new Decimal(first).greaterThan(new Decimal(second));
    }

    public static greaterThanOrEqualTo(first: string, second: string): boolean {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            throw new Error(`Invalid arguments`);
        }
        return new Decimal(first).greaterThanOrEqualTo(new Decimal(second));
    }

    public static equals(first: string, second: string): boolean {
        if (MathUtil.isInvalid(first) || MathUtil.isInvalid(second)) {
            throw new Error(`Invalid arguments`);
        }
        return new Decimal(first).equals(new Decimal(second));
    }
}

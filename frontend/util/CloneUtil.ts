export class CloneUtil {
    // --------------------------------------------------------------------------
    //
    // 	Clone Methods
    //
    // --------------------------------------------------------------------------

    public static deepExtend(...params): any {
        if (arguments.length < 1 || typeof arguments[0] !== 'object') {
            return false;
        }

        if (arguments.length < 2) {
            return arguments[0];
        }

        let target = arguments[0];
        let args = Array.prototype.slice.call(arguments, 1);
        let val, src, clone;

        args.forEach(obj => {
            if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return;

            Object.keys(obj).forEach(key => {
                src = CloneUtil.safeGetProperty(target, key); // source value
                val = CloneUtil.safeGetProperty(obj, key); // new value

                if (val === target) {
                    return;
                } else if (typeof val !== 'object' || val === null) {
                    target[key] = val;
                    return;
                } else if (Array.isArray(val)) {
                    target[key] = CloneUtil.deepCloneArray(val);
                    return;
                } else if (CloneUtil.isSpecificValue(val)) {
                    target[key] = CloneUtil.cloneSpecificValue(val);
                    return;
                } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
                    target[key] = CloneUtil.deepExtend({}, val);
                    return;
                } else {
                    target[key] = CloneUtil.deepExtend(src, val);
                    return;
                }
            });
        });
        return target;
    }

    private static isSpecificValue(value: any): boolean {
        return value instanceof Buffer || value instanceof Date || value instanceof RegExp;
    }

    private static cloneSpecificValue(value: any): any {
        if (value instanceof Buffer) {
            let buffer = Buffer.alloc ? Buffer.alloc(value.length) : new Buffer(value.length);
            value.copy(buffer);
            return buffer;
        } else if (value instanceof Date) {
            return new Date(value.getTime());
        } else if (value instanceof RegExp) {
            return new RegExp(value);
        } else {
            throw new Error('Unexpected situation');
        }
    }
    private static safeGetProperty(object, property): any {
        return property === '__proto__' ? undefined : object[property];
    }

    private static deepCloneArray(arr: any): any {
        let clone = [];
        arr.forEach((item, index) => {
            if (typeof item === 'object' && item != null) {
                if (Array.isArray(item)) {
                    clone[index] = CloneUtil.deepCloneArray(item);
                } else if (CloneUtil.isSpecificValue(item)) {
                    clone[index] = CloneUtil.cloneSpecificValue(item);
                } else {
                    clone[index] = CloneUtil.deepExtend({}, item);
                }
            } else {
                clone[index] = item;
            }
        });
        return clone;
    }
}

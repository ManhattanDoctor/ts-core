import * as _ from 'lodash';
import * as uuid from 'uuid';
import { ITraceable } from './ITraceable';

export class TraceUtil {
    // --------------------------------------------------------------------------
    //
    // 	Static Methods
    //
    // --------------------------------------------------------------------------

    public static addIfNeed<T>(item?: T): T & ITraceable {
        if (_.isNil(item)) {
            item = {} as any;
        }
        if (!TraceUtil.isHas(item)) {
            (item as ITraceable).traceId = TraceUtil.generate();
        }
        return item;
    }

    public static copy<T>(from: ITraceable, to: T, isCreateIfNeed?: boolean): T & ITraceable {
        if (_.isNil(from) || _.isNil(to)) {
            return to;
        }
        if (isCreateIfNeed) {
            from = TraceUtil.addIfNeed(from);
        }
        (to as ITraceable).traceId = from.traceId;
        return to;
    }

    public static isHas(item: ITraceable): boolean {
        return _.isNil(item) ? false : !_.isNil(item.traceId);
    }

    public static generate(): string {
        return uuid();
    }
}

import * as _ from 'lodash';
import { Destroyable } from '../../frontend';
import { MapCollection } from './MapCollection';

export class DestroyableMapCollection<U extends Destroyable> extends MapCollection<U> {
    //--------------------------------------------------------------------------
    //
    //	Public Methods
    //
    //--------------------------------------------------------------------------

    public clear(): void {
        if (this.map.size > 0) {
            this.map.forEach(item => item.destroy());
        }
        super.clear();
    }

    public remove(key: string): U {
        let item = super.remove(key);
        if (!_.isNil(item)) {
            item.destroy();
        }
        return item;
    }
}

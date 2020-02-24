import { IDestroyable } from '../IDestroyable';
import { MapCollection } from './MapCollection';

export class DestroyableMapCollection<U> extends MapCollection<U> {
    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected destroyItem(item: U): U {
        IDestroyable.destroy(item);
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public clear(): void {
        if (this.map.size > 0) {
            this.map.forEach(item => this.destroyItem(item));
        }
        super.clear();
    }

    public remove(key: string): U {
        return this.destroyItem(super.remove(key));
    }
}

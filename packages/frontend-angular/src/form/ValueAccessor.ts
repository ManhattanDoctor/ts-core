import { ControlValueAccessor } from '@angular/forms';
import { Destroyable } from '@ts-core/common';

export class ValueAccessor<T> extends Destroyable implements ControlValueAccessor {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private innerValue: T;
    private changed: Array<(value: T) => void>;
    private touched: Array<() => void>;

    // --------------------------------------------------------------------------
    //
    //	Constuctor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super();
        this.changed = [];
        this.touched = [];
    }

    // --------------------------------------------------------------------------
    //
    //	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected valueChanged(): void {
        this.changed.forEach(f => f(this.innerValue));
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public touch(): void {
        this.touched.forEach(f => f());
    }

    public writeValue(value: T): void {
        this.value = value;
    }

    public registerOnChange(fn: (value: T) => void): void {
        this.changed.push(fn);
    }

    public registerOnTouched(fn: () => void): void {
        this.touched.push(fn);
    }

    public destroy(): void {
        super.destroy();
        if (this.isDestroyed) {
            return;
        }
        this.changed = null;
        this.touched = null;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get value(): T {
        return this.innerValue;
    }

    public set value(value: T) {
        if (value == this.innerValue) {
            return;
        }
        this.innerValue = value;
        this.valueChanged();
    }
}

import { NgModel } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AsyncValidatorArray, message, validate, ValidationResult, ValidatorArray } from './validate';
import { ValueAccessor } from './ValueAccessor';

export abstract class FormElementAsync<T> extends ValueAccessor<T> {
    //--------------------------------------------------------------------------
    //
    //  Properties
    //
    //--------------------------------------------------------------------------

    protected abstract model: NgModel;

    //--------------------------------------------------------------------------
    //
    //  Constructor
    //
    //--------------------------------------------------------------------------

    constructor(private validators: ValidatorArray, private asyncValidators: AsyncValidatorArray) {
        super();
    }

    protected validate(): Observable<ValidationResult> {
        return validate(this.validators, this.asyncValidators)(this.model.control);
    }

    protected get invalid(): Observable<boolean> {
        return this.validate().pipe(
            map(v => {
                return Object.keys(v || {}).length > 0;
            })
        );
    }

    protected get failures(): Observable<Array<string>> {
        return this.validate().pipe(map(v => Object.keys(v).map(k => message(v, k))));
    }
}

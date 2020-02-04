import { AbstractControl, AsyncValidatorFn, Validator, ValidatorFn, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { of } from 'rxjs';

// --------------------------------------------------------------------------
//
//  Export Properties
//
// --------------------------------------------------------------------------

export type ValidationResult = { [validator: string]: string | boolean };
export type ValidatorArray = Array<Validator | ValidatorFn>;
export type AsyncValidatorArray = Array<Validator | AsyncValidatorFn>;

let normalizeValidator = (validator: Validator | ValidatorFn): ValidatorFn | AsyncValidatorFn => {
    let func = (validator as Validator).validate.bind(validator);
    if (typeof func === 'function') {
        return (control: AbstractControl) => func(control);
    } else {
        return <ValidatorFn | AsyncValidatorFn>validator;
    }
};

export let composeValidators = (validators: ValidatorArray): AsyncValidatorFn | ValidatorFn => {
    if (_.isEmpty(validators)) {
        return null;
    }
    return Validators.compose(validators.map(normalizeValidator));
};

export let validate = (validators: ValidatorArray, asyncValidators: AsyncValidatorArray) => {
    return (control: AbstractControl) => {
        let synchronousValid = () => composeValidators(validators)(control);
        if (asyncValidators) {
            let asyncValidator = composeValidators(asyncValidators);
            return asyncValidator(control).map(v => {
                let secondary = synchronousValid();
                if (secondary || v) {
                    return Object.assign({}, secondary, v);
                }
            });
        }
        if (validators) {
            return of(synchronousValid());
        }
        return of(null);
    };
};

export const message = (validator: ValidationResult, key: string): string => {
    if (!key) {
        return 'Validation failed: ' + validator.toString();
    }

    switch (key) {
        case 'required':
            return 'Please enter a value';
        case 'pattern':
            return 'Value does not match required pattern';
        case 'minlength':
            return 'Value must be N characters';
        case 'maxlength':
            return 'Value must be a maximum of N characters';
    }

    let value = validator[key];
    switch (typeof value) {
        case 'string':
            return value as string;
        default:
            return 'Validation failed: ' + key;
    }
};

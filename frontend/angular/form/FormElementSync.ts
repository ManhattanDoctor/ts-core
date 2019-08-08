import { AfterContentInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, NgModel, Validator, ValidatorFn } from '@angular/forms';
import { message, ValidationResult } from './validate';
import { ValueAccessor } from './ValueAccessor';

export abstract class FormElementSync<T> extends ValueAccessor<T> implements AfterContentInit, OnDestroy {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    protected abstract model: NgModel;
    protected _validationError: string;
    protected timer: any;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(private validators: Array<Validator | ValidatorFn>) {
        super();
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected valueChanged(): void {
        super.valueChanged();
        setTimeout(this.validate);
    }

    protected validate = (): ValidationResult => {
        if (!this.validators || this.validators.length === 0) {
            this._validationError = null;
            return null;
        }

        let failure: ValidationResult = null;
        for (let item of this.validators) {
            failure = typeof item === 'function' ? item(this.model.control) : item.validate(this.model.control);
            if (failure) {
                break;
            }
        }
        this._validationError = failure ? message(failure, Object.keys(failure)[0]) : null;
        return failure;
    };

    public get valid(): boolean {
        return !this.invalid;
    }

    public get invalid(): boolean {
        return this._validationError != null;
    }

    public get validationError(): string {
        return this._validationError;
    }

    protected isErrorState = (control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean => {
        return this.invalid;
    };

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public ngAfterContentInit(): void {
        this.validate();
    }

    public ngOnDestroy(): void {
        clearTimeout(this.timer);
        this.timer = null;
    }
}

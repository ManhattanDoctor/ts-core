import * as _ from 'lodash';
import { ExtendedError } from '../error';
import { ITransportEvent } from './ITransport';
import { IsString, IsOptional } from 'class-validator';

export class TransportEvent<T> implements ITransportEvent<T> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @IsString()
    public name: string;

    @IsOptional()
    public data: T;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(name: string, data?: T) {
        this.name = name;

        if (!_.isNil(data)) {
            this.validateData(data);
            this.data = data;
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Properties
    //
    // --------------------------------------------------------------------------

    protected validateData(value: T): void {
        if (_.isNil(value)) {
            throw new ExtendedError('Data is undefined');
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public toObject(): ITransportEvent<T> {
        return { name: this.name, data: this.data };
    }
}

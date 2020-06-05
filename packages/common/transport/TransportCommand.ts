import * as uuid from 'uuid';
import { ITransportCommand } from './ITransport';
import { IsString, IsDefined } from 'class-validator';
import * as _ from 'lodash';
import { ValidateUtil } from '../util';

export class TransportCommand<T> implements ITransportCommand<T> {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    @IsString()
    public id: string;

    @IsString()
    public name: string;

    @IsDefined()
    public request: T;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(name: string, request?: T, id?: string) {
        this.id = !_.isNil(id) ? id : uuid();
        this.name = name;
        this.request = this.validateRequest(request || ({} as any));
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected validateRequest(value: T): T {
        ValidateUtil.validate(value);
        return value;
    }
}

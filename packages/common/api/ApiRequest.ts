import { Destroyable } from '../../common/Destroyable';
import { IApiRequestConfig } from './IApiRequestConfig';

export class ApiRequest<T = any> extends Destroyable {
    // --------------------------------------------------------------------------
    //
    // 	Private Properties
    //
    // --------------------------------------------------------------------------

    private _config: IApiRequestConfig<T>;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(config: IApiRequestConfig<T>) {
        super();
        this._config = config;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public toString(): string {
        return JSON.stringify(this.data);
    }

    public destroy(): void {
        this._config = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get data(): T {
        return this._config.data;
    }

    public get config(): IApiRequestConfig<T> {
        return this._config;
    }
}

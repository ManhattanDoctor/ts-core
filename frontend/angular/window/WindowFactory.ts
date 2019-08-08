import { IWindow } from './IWindow';
import { WindowConfig } from './WindowConfig';
import { WindowProperties } from './WindowProperties';

export class WindowFactory<U extends IWindow> {
    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected classType: { new (properties: WindowProperties): U }) {}

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public create(properties: WindowProperties): U {
        return new this.classType(properties);
    }
}

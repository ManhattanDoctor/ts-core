import { IWindow } from './IWindow';
import { WindowConfig } from './WindowConfig';
import { WindowProperties } from './WindowProperties';

export class WindowFactory<U extends IWindow> {
    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected classType: any) {}

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public create(properties: WindowProperties): U {
        let window = new this.classType(properties);
        return window;
    }

    public createConfig(isModal: boolean = false, isResizeable: boolean = false, width: number = NaN, height: number = NaN): WindowConfig {
        return new WindowConfig(isModal, isResizeable, width, height);
    }
}

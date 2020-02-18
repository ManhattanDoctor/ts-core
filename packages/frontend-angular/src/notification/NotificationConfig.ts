import { WindowConfig } from '../window/WindowConfig';

export class NotificationConfig<T = any> extends WindowConfig<T> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public icon: string;
    public sound: string;
    public iconId: string;
    public picture: string;

    public closeDuration: number = NaN;
    public isRemoveAfterClose: boolean = false;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data?: T) {
        super();
        this.data = data;
        this.isModal = false;
    }
}

export type NotificationConfigOptions<T = any> = { [P in keyof NotificationConfig<T>]?: any };

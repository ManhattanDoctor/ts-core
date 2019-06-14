import { QuestionMode } from '../question';
import { WindowConfig } from '../window';

export class NotificationConfig<T = any> extends WindowConfig {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    public data: T;
    public icon: string;
    public sound: string;
    public iconId: string;
    public picture: string;

    public closeDuration: number = NaN;
    public isRemoveAfterClose: boolean = false;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(data?: T) {
        super();
        this.data = data;
        this.isModal = false;
    }
}

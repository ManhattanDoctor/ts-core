import { QuestionMode } from '../IQuestion';
import { WindowConfig } from '../window';
import { INotification } from './INotification';

export class NotificationConfig<T = any> extends WindowConfig {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public data: T;
    public icon: string;
    public iconId: string;
    public sound: string;
    public picture: string;
    public mode: QuestionMode;

    public noCallback: (item: INotification) => void;
    public yesCallback: (item: INotification) => void;

    public closeDuration: number;
    public isRemoveAfterClose: boolean = false;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data?: T, picture?: string) {
        super();
        this.data = data;
        this.mode = QuestionMode.INFO;
        this.picture = picture;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public destroy(): void {
        super.destroy();

        this.noCallback = null;
        this.yesCallback = null;
    }
}

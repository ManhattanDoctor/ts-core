import { QuestionMode } from '../question';
import { INotification } from './INotification';
import { NotificationConfig } from './NotificationConfig';
import { NotificationProperties } from './NotificationProperties';

export class NotificationFactory<U extends INotification> {
    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected classType: { new (properties: NotificationProperties): U }) {}

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public create(properties: NotificationProperties): U {
        return new this.classType(properties);
    }
}

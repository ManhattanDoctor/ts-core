import { BreakpointObserver } from '@angular/cdk/layout';
import { DestroyableContainer } from '@ts-core/common';
import * as _ from 'lodash';
import { filter, takeUntil } from 'rxjs/operators';
import { NotificationConfig } from '../notification/NotificationConfig';
import { NotificationService, NotificationServiceEvent } from '../notification/NotificationService';

export class ShellBaseComponent extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public isNeedSide: boolean = false;
    public isHasNotifications: boolean = false;

    public isShowMenu: boolean = true;
    public isShowNotifications: boolean = false;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(public notifications: NotificationService, public breakpointObserver: BreakpointObserver) {
        super();
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected initialize(): void {
        // Notifications
        this.isHasNotificationsCheck();
        this.notifications.events
            .pipe(
                filter(data => data.type === NotificationServiceEvent.CLOSED || data.type === NotificationServiceEvent.REMOVED),
                takeUntil(this.destroyed)
            )
            .subscribe(() => this.isHasNotificationsCheck());

        // Menu Size
        this.isNeedSideCheck();
        this.breakpointObserver
            .observe(this.sideMediaQueryToCheck)
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => this.isNeedSideCheck());
    }

    protected isHasNotificationsCheck(): void {
        this.isHasNotifications = !_.isEmpty(this.notificationItems);
        if (!this.isHasNotifications) {
            this.isShowNotifications = false;
        }
    }

    protected isNeedSideCheck(): void {
        this.isNeedSide = this.breakpointObserver.isMatched(this.sideMediaQueryToCheck);
        this.isShowMenu = this.isNeedSide;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public toggleMenu(): void {
        if (!this.isNeedSide) {
            this.isShowMenu = !this.isShowMenu;
        }
    }

    public toggleNotifications(): void {
        this.isShowNotifications = !this.isShowNotifications;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    protected get sideMediaQueryToCheck(): string {
        return `(min-width: 1000px)`;
    }

    public get notificationItems(): Array<NotificationConfig> {
        return this.notifications.closedConfigs;
    }
}

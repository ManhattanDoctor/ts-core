import { BreakpointObserver } from '@angular/cdk/layout';
import * as _ from 'lodash';
import { filter } from 'rxjs/operators';
import { DestroyableContainer } from '@ts-core/common';
import { MenuItems, NavigationMenuItem } from '../menu';
import { NotificationConfig, NotificationService, NotificationServiceEvent } from '../notification';
import { RouterBaseService, RouterBaseServiceEvent } from '../router';

export abstract class ShellBaseComponent extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    public menu: MenuItems;
    public activeItem: NavigationMenuItem;

    public isNeedSide: boolean = false;
    public isHasNotifications: boolean = false;

    public isShowMenu: boolean = true;
    public isShowNotifications: boolean = false;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(public router: RouterBaseService, public notifications: NotificationService, public breakpointObserver: BreakpointObserver) {
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
        this.addSubscription(
            this.notifications.events
                .pipe(filter(data => data.type === NotificationServiceEvent.CLOSED || data.type === NotificationServiceEvent.REMOVED))
                .subscribe(this.isHasNotificationsCheck)
        );
        // Routing
        this.addSubscription(this.router.events.pipe(filter(data => data.type === RouterBaseServiceEvent.LOADING_CHANGED)).subscribe(this.activeItemCheck));

        // Menu Size
        this.isNeedSideCheck();
        this.addSubscription(this.breakpointObserver.observe(this.sideMediaQueryToCheck).subscribe(this.isNeedSideCheck));

        this.initializeMenu();
        this.activeItemCheck();
    }

    protected abstract initializeMenu(): void;

    protected activeItemCheck = (): void => {
        for (let item of this.menu.items) {
            if (!(item instanceof NavigationMenuItem)) {
                continue;
            }
            item.isActive = this.router.url.includes(item.url);
        }
    };

    protected isHasNotificationsCheck = (): void => {
        this.isHasNotifications = !_.isEmpty(this.notificationItems);
        if (!this.isHasNotifications) {
            this.isShowNotifications = false;
        }
    };

    protected isNeedSideCheck = (): void => {
        this.isNeedSide = this.breakpointObserver.isMatched(this.sideMediaQueryToCheck);
        this.isShowMenu = this.isNeedSide;
    };

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

    public destroy(): void {
        super.destroy();
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

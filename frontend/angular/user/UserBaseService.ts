import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { ObservableData } from '../../../common/observer';
import { LoginBaseService, LoginBaseServiceEvent } from '../login';
import { IUser } from './IUser';

export abstract class UserBaseService<U, V extends IUser> {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    protected _user: V;
    protected observer: Subject<ObservableData<U | UserBaseServiceEvent, V>>;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(protected login: LoginBaseService) {
        this.observer = new Subject();
    }

    //--------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    //--------------------------------------------------------------------------

    protected initialize(): void {
        if (this.login.isLoggedIn) {
            this.loginedHandler();
        }

        this.login.events.subscribe(data => {
            if (data.type === LoginBaseServiceEvent.LOGIN_COMPLETE) {
                this.loginedHandler();
            } else if (data.type === LoginBaseServiceEvent.LOGOUT_FINISHED) {
                this.logoutedHandler();
            }
        });
    }

    protected loginedHandler(): void {
        this._user = this.createUser(this.login.loginData);
        this.observer.next(new ObservableData(UserBaseServiceEvent.LOGINED, this.user));
    }

    protected logoutedHandler(): void {
        this._user = null;
        this.observer.next(new ObservableData(UserBaseServiceEvent.LOGOUTED));
    }

    protected abstract createUser(data: any): V;

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public isUser(value: any): boolean {
        if (!value || !this.user) {
            return false;
        }
        if (value.hasOwnProperty('id')) {
            return this.user.id === value.id;
        }

        return this.user.id === value;
    }

    public updateUser(data: any): void {
        if (!this.hasUser) {
            return;
        }
        this.user.update(data);
        this.observer.next(new ObservableData(UserBaseServiceEvent.CHANGED));
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    //--------------------------------------------------------------------------

    public get events(): Observable<ObservableData<U | UserBaseServiceEvent, V>> {
        return this.observer.asObservable();
    }

    public get hasUser(): boolean {
        return !_.isNil(this._user);
    }

    public get isLogined(): boolean {
        return this.hasUser;
    }

    public get user(): V {
        return this._user;
    }

    public get id(): string | number {
        return this.hasUser ? this.user.id : null;
    }
}

export enum UserBaseServiceEvent {
    LOGINED = 'LOGINED',
    CHANGED = 'CHANGED',
    LOGOUTED = 'LOGOUTED'
}

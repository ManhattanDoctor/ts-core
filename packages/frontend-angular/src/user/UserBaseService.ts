import { ObservableData } from '@ts-core/common/observer';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { LoginBaseService, LoginBaseServiceEvent } from '../login/LoginBaseService';
import { IUser } from './IUser';

export abstract class UserBaseService<U extends IUser = any, V = void> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _user: U;
    protected observer: Subject<ObservableData<V | UserBaseServiceEvent, U>>;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(protected login: LoginBaseService) {
        this.observer = new Subject();
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

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

    protected initializeUser(): void {
        this._user = this.createUser(this.login.loginData);
    }
    protected deinitializeUser(): void {
        this._user = null;
    }

    protected loginedHandler(): void {
        this.initializeUser();
        this.observer.next(new ObservableData(UserBaseServiceEvent.LOGINED, this.user));
    }

    protected logoutedHandler(): void {
        this.deinitializeUser();
        this.observer.next(new ObservableData(UserBaseServiceEvent.LOGOUTED));
    }

    protected abstract createUser(data: any): U;

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

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
        this.observer.next(new ObservableData(UserBaseServiceEvent.CHANGED, data));
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<ObservableData<V | UserBaseServiceEvent, U>> {
        return this.observer.asObservable();
    }

    public get logined(): Observable<U> {
        return this.events.pipe(
            filter(item => item.type === UserBaseServiceEvent.LOGINED),
            map(item => item.data)
        );
    }

    public get changed(): Observable<any> {
        return this.events.pipe(
            filter(item => item.type === UserBaseServiceEvent.CHANGED),
            map(item => item.data)
        );
    }

    public get logouted(): Observable<void> {
        return this.events.pipe(
            filter(item => item.type === UserBaseServiceEvent.LOGOUTED),
            map(() => null)
        );
    }

    public get hasUser(): boolean {
        return !_.isNil(this._user);
    }

    public get isLogined(): boolean {
        return this.hasUser;
    }

    public get user(): U {
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

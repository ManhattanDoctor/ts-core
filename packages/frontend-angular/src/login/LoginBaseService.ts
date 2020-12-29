import { LoadableEvent, Loadable, LoadableStatus } from '@ts-core/common';
import { ExtendedError } from '@ts-core/common/error';
import { ObservableData } from '@ts-core/common/observer';
import { TransportNoConnectionError, TransportTimeoutError } from '@ts-core/common/transport';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import * as _ from 'lodash';

export abstract class LoginBaseService<E = any, U = any, V = any> extends Loadable<E | LoginBaseServiceEvent, U | V | ExtendedError> {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _sid: string;
    protected _resource: string;

    protected _loginData: V;
    protected _isLoggedIn: boolean = false;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super();
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    /*
    protected async loginByParam(param?: any): Promise<void> {
        if (this.isLoggedIn || this.isLoading) {
            return;
        }

        this.status = LoadableStatus.LOADING;
        this.observer.next(new ObservableData(LoadableEvent.STARTED));
        this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGIN_STARTED));

        try {
            this.parseLoginResponse(await this.loginRequest(param));
            this.status = !this.isCanLoginWithSid() ? LoadableStatus.LOADED : LoadableStatus.LOADING;
            if (this.isLoading) {
                this.loginBySid();
            }
        } catch (error) {
            error = ExtendedError.create(error);

            this.status = LoadableStatus.ERROR;
            this.parseLoginErrorResponse(error);
            this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGIN_ERROR, null, error));
        }

        if (!this.isLoading) {
            this.observer.next(new ObservableData(LoadableEvent.FINISHED));
            this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGIN_FINISHED));
        }
    }
    */

    protected async loginByParam(param?: any): Promise<U> {
        return this.loginByFunction(() => this.loginRequest(param));
    }

    protected async loginByFunction(sidReturnFunction: (...params) => Promise<U>): Promise<U> {
        if (this.isLoggedIn || this.isLoading) {
            return null;
        }

        let response: U;
        this.status = LoadableStatus.LOADING;
        this.observer.next(new ObservableData(LoadableEvent.STARTED));
        this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGIN_STARTED));

        try {
            response = await sidReturnFunction();
            this.parseLoginResponse(response);
            if (!this.isCanLoginWithSid()) {
                this.status = LoadableStatus.LOADED;
            } else {
                this.loginBySid();
            }
        } catch (error) {
            error = ExtendedError.create(error);

            this.status = LoadableStatus.ERROR;
            this.parseLoginErrorResponse(error);
            this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGIN_ERROR, null, error));
        }

        if (!this.isLoading) {
            this.observer.next(new ObservableData(LoadableEvent.FINISHED));
            this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGIN_FINISHED));
        }
        return response;
    }

    protected async loginBySid(): Promise<void> {
        if (_.isNil(this.sid)) {
            this._sid = this.getSavedSid();
        }

        try {
            let response = await this.loginSidRequest();
            this.parseLoginSidResponse(response);

            this._isLoggedIn = true;
            this.status = LoadableStatus.LOADED;
            this.observer.next(new ObservableData(LoadableEvent.COMPLETE, response));
            this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGIN_COMPLETE, response));
        } catch (error) {
            error = ExtendedError.create(error);
            this.parseLoginSidErrorResponse(error);

            this._isLoggedIn = false;
            this.status = LoadableStatus.ERROR;
            this.observer.next(new ObservableData(LoadableEvent.ERROR, null, error));
            this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGIN_ERROR, null, error));
        }

        this.observer.next(new ObservableData(LoadableEvent.FINISHED));
        this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGIN_FINISHED));
    }

    protected reset(): void {
        this._sid = null;
        this._resource = null;
        this._loginData = null;
    }

    protected abstract loginRequest(...params): Promise<U>;
    protected abstract loginSidRequest(): Promise<V>;

    protected abstract logoutRequest(): Promise<void>;
    protected abstract getSavedSid(): string;

    // --------------------------------------------------------------------------
    //
    // 	Parse Methods
    //
    // --------------------------------------------------------------------------

    protected abstract parseLoginResponse(response: U): void;

    protected parseLoginErrorResponse(error: ExtendedError): void {}

    protected parseLoginSidResponse(response: V): void {
        this._loginData = response;
    }

    protected parseLoginSidErrorResponse(error: ExtendedError): void {
        if (error instanceof TransportTimeoutError || error instanceof TransportNoConnectionError) {
            return;
        }
        this.reset();
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    // --------------------------------------------------------------------------

    public abstract login(param: any): void;

    public abstract registration(param: any): void;

    public tryLoginBySid(): boolean {
        if (!this.isCanLoginWithSid()) {
            return false;
        }

        if (!this.isLoggedIn && !this.isLoading) {
            this.observer.next(new ObservableData(LoadableEvent.STARTED));
            this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGIN_STARTED));
            this.loginBySid();
        }
        return true;
    }

    public logout(): void {
        if (!this.isLoggedIn) {
            return;
        }

        this.observer.next(new ObservableData(LoadableEvent.STARTED));
        this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGOUT_STARTED));

        this.logoutRequest();
        this.reset();

        this._isLoggedIn = false;
        this.status = LoadableStatus.NOT_LOADED;
        this.observer.next(new ObservableData(LoadableEvent.FINISHED));
        this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGOUT_FINISHED));
    }

    public isCanLoginWithSid(): boolean {
        return this.sid != null || this.getSavedSid() != null;
    }

    public destroy(): void {
        super.destroy();
        this.reset();
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get logined(): Observable<V> {
        return this.events.pipe(
            filter(item => item.type === LoginBaseServiceEvent.LOGIN_COMPLETE),
            map(item => item.data as V)
        );
    }

    public get logouted(): Observable<void> {
        return this.events.pipe(
            filter(item => item.type === LoginBaseServiceEvent.LOGOUT_FINISHED),
            map(() => null)
        );
    }

    public get sid(): string {
        return this._sid;
    }

    public get resource(): string {
        return this._resource;
    }

    public get loginData(): V {
        return this._loginData;
    }

    public get isLoggedIn(): boolean {
        return this._isLoggedIn;
    }
}

export enum LoginBaseServiceEvent {
    LOGIN_ERROR = 'LOGIN_ERROR',
    LOGIN_STARTED = 'LOGIN_STARTED',
    LOGIN_COMPLETE = 'LOGIN_COMPLETE',
    LOGIN_FINISHED = 'LOGIN_FINISHED',
    LOGOUT_STARTED = 'LOGOUT_STARTED',
    LOGOUT_FINISHED = 'LOGOUT_FINISHED',

    REGISTRATION_ERROR = 'REGISTRATION_ERROR',
    REGISTRATION_STARTED = 'REGISTRATION_STARTED',
    REGISTRATION_COMPLETE = 'REGISTRATION_COMPLETE',
    REGISTRATION_FINISHED = 'REGISTRATION_FINISHED'
}

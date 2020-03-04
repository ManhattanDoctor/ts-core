import { Destroyable, LoadableEvent } from '@ts-core/common';
import { ExtendedError } from '@ts-core/common/error';
import { ObservableData } from '@ts-core/common/observer';
import { TransportNoConnectionError, TransportTimeoutError } from '@ts-core/common/transport';
import { Observable, Subject } from 'rxjs';

export abstract class LoginBaseService<E = any, U = any, V = any> extends Destroyable {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected _sid: string;
    protected _resource: string;

    protected _loginData: V;
    protected _isLoading: boolean = false;
    protected _isLoggedIn: boolean = false;

    protected observer: Subject<ObservableData<E | LoadableEvent | LoginBaseServiceEvent, U | V>>;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor() {
        super();
        this.observer = new Subject();
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async loginByParam(param?: any): Promise<void> {
        if (this.isLoggedIn || this.isLoading) {
            return;
        }

        this._isLoading = true;
        this.observer.next(new ObservableData(LoadableEvent.STARTED));
        this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGIN_STARTED));

        try {
            this.parseLoginResponse(await this.loginRequest(param));
            if (this.isCanLoginWithSid()) {
                this.loginBySid();
            }
        } catch (error) {
            error = ExtendedError.create(error);

            this.parseLoginErrorResponse(error);
            this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGIN_ERROR, null, error));

            this.observer.next(new ObservableData(LoadableEvent.FINISHED));
            this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGIN_FINISHED));
        }
    }

    protected async loginBySid(): Promise<void> {
        if (!this.sid) {
            this._sid = this.getSavedSid();
        }

        this._isLoading = true;

        try {
            let response = await this.loginSidRequest();
            this.parseLoginSidResponse(response);

            this._isLoggedIn = true;
            this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGIN_COMPLETE, response));
        } catch (error) {
            error = ExtendedError.create(error);
            this.parseLoginSidErrorResponse(error);

            this._isLoggedIn = false;
            this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGIN_ERROR, null, error));
        }

        this._isLoading = false;
        this.observer.next(new ObservableData(LoadableEvent.FINISHED));
        this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGIN_FINISHED));
    }

    protected reset(): void {
        this._sid = null;
        this._resource = null;
    }

    protected abstract loginRequest(param: any): Promise<U>;
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
        this.observer.next(new ObservableData(LoadableEvent.FINISHED));
        this.observer.next(new ObservableData(LoginBaseServiceEvent.LOGOUT_FINISHED));
    }

    public isCanLoginWithSid(): boolean {
        return this.sid != null || this.getSavedSid() != null;
    }

    public destroy(): void {
        if (this.observer) {
            this.observer.complete();
            this.observer = null;
        }
        this._loginData = null;
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<ObservableData<E | LoadableEvent | LoginBaseServiceEvent, any>> {
        return this.observer.asObservable();
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

    public get isLoading(): boolean {
        return this._isLoading;
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

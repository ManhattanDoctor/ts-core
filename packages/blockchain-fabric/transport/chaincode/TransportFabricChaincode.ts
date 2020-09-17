import { ExtendedError } from '@ts-core/common/error';
import { ILogger, LoggerWrapper } from '@ts-core/common/logger';
import { ObservableData } from '@ts-core/common/observer';
import { TransformUtil } from '@ts-core/common/util';
import * as shim from 'fabric-shim';
import { ChaincodeInterface, ChaincodeResponse, ChaincodeStub } from 'fabric-shim';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { TransportFabricResponsePayload } from '../TransportFabricResponsePayload';
import { TransportFabricChaincodeTransport } from './TransportFabricChaincodeTransport';

export abstract class TransportFabricChaincode<T> extends LoggerWrapper implements ChaincodeInterface {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected observer: Subject<ObservableData<T | TransportFabricChaincodeEvent, ITransportFabricChaincodeEventData>>;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, protected transport: TransportFabricChaincodeTransport) {
        super(logger);
        this.observer = new Subject();
    }

    // --------------------------------------------------------------------------
    //
    //  Chaincode Methods
    //
    // --------------------------------------------------------------------------

    public async Init(stub: ChaincodeStub): Promise<ChaincodeResponse> {
        this.debug(`Chaincode "${this.name}" inited`);
        this.observer.next(new ObservableData(TransportFabricChaincodeEvent.INITED, { stub }));
        return shim.success();
    }

    public async Invoke(stub: ChaincodeStub): Promise<ChaincodeResponse> {
        this.observer.next(new ObservableData(TransportFabricChaincodeEvent.INVOKE_STARTED, { stub }));

        let response = await this.transport.invoke(stub);

        let event = { stub, response };
        let isHasResponse = !_.isNil(response);

        let isError = isHasResponse && ExtendedError.instanceOf(response.response);
        if (isError) {
            this.observer.next(new ObservableData(TransportFabricChaincodeEvent.INVOKE_ERROR, event));
        } else {
            this.observer.next(new ObservableData(TransportFabricChaincodeEvent.INVOKE_COMPLETE, event));
        }
        this.observer.next(new ObservableData(TransportFabricChaincodeEvent.INVOKE_FINISHED, event));

        let content = this.getContent(response);
        return isError ? shim.error(content) : shim.success(content);
    }

    // --------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    // --------------------------------------------------------------------------

    protected getContent<U>(response: TransportFabricResponsePayload<U>): Buffer {
        return !_.isNil(response) ? TransformUtil.fromClassBuffer(response) : Buffer.from('');
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<ObservableData<T | TransportFabricChaincodeEvent, ITransportFabricChaincodeEventData>> {
        return this.observer.asObservable();
    }

    public abstract get name(): string;
}

export interface ITransportFabricChaincodeEventData {
    stub: ChaincodeStub;
    response?: TransportFabricResponsePayload;
}

export enum TransportFabricChaincodeEvent {
    INITED = 'INITED',
    INVOKE_ERROR = 'INVOKE_ERROR',
    INVOKE_STARTED = 'INVOKE_STARTED',
    INVOKE_COMPLETE = 'INVOKE_COMPLETE',
    INVOKE_FINISHED = 'INVOKE_FINISHED'
}

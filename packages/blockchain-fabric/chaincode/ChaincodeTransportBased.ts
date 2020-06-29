import { ExtendedError } from '@ts-core/common/error';
import { ILogger, LoggerWrapper } from '@ts-core/common/logger';
import { ObservableData } from '@ts-core/common/observer';
import { TransformUtil } from '@ts-core/common/util';
import * as shim from 'fabric-shim';
import { ChaincodeInterface, ChaincodeResponse, ChaincodeStub } from 'fabric-shim';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { TransportFabricResponsePayload } from '../transport/TransportFabricResponsePayload';
import { TransportFabricChaincode } from './TransportFabricChaincode';

export abstract class ChaincodeTransportBased<T> extends LoggerWrapper implements ChaincodeInterface {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected observer: Subject<ObservableData<T | ChaincodeTransportBasedEvent, IChaincodeTransportEventData>>;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, protected transport: TransportFabricChaincode) {
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
        this.observer.next(new ObservableData(ChaincodeTransportBasedEvent.INITED, { stub }));
        return shim.success();
    }

    public async Invoke(stub: ChaincodeStub): Promise<ChaincodeResponse> {
        this.observer.next(new ObservableData(ChaincodeTransportBasedEvent.INVOKE_STARTED, { stub }));

        let response = await this.transport.invoke(stub);

        let event = { stub, response };
        let isHasResponse = !_.isNil(response);

        let isError = isHasResponse && ExtendedError.instanceOf(response.response);
        if (isError) {
            this.observer.next(new ObservableData(ChaincodeTransportBasedEvent.INVOKE_ERROR, event));
        } else {
            this.observer.next(new ObservableData(ChaincodeTransportBasedEvent.INVOKE_COMPLETE, event));
        }
        this.observer.next(new ObservableData(ChaincodeTransportBasedEvent.INVOKE_FINISHED, event));

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

    public get events(): Observable<ObservableData<T | ChaincodeTransportBasedEvent, IChaincodeTransportEventData>> {
        return this.observer.asObservable();
    }

    public abstract get name(): string;
}

export interface IChaincodeTransportEventData {
    stub: ChaincodeStub;
    response?: TransportFabricResponsePayload;
}

export enum ChaincodeTransportBasedEvent {
    INITED = 'INITED',

    INVOKE_ERROR = 'INVOKE_ERROR',
    INVOKE_STARTED = 'INVOKE_STARTED',
    INVOKE_COMPLETE = 'INVOKE_COMPLETE',
    INVOKE_FINISHED = 'INVOKE_FINISHED'
}

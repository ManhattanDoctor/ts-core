import { ExtendedError } from '@ts-core/common/error';
import { ILogger, LoggerWrapper } from '@ts-core/common/logger';
import { ObservableData } from '@ts-core/common/observer';
import { TransformUtil } from '@ts-core/common/util';
import * as shim from 'fabric-shim';
import { ChaincodeInterface, ChaincodeResponse, ChaincodeStub } from 'fabric-shim';
import { Observable, Subject } from 'rxjs';
import { TransportFabric } from '../fabric/transport/TransportFabric';
import { TransportFabricResponsePayload } from '../fabric/transport/TransportFabricResponsePayload';

export abstract class ChaincodeBaseService<T> extends LoggerWrapper implements ChaincodeInterface {
    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    protected observer: Subject<ObservableData<T | ChaincodeBaseServiceEvent, ChaincodeStub | ExtendedError | TransportFabricResponsePayload>>;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: ILogger, protected transport: TransportFabric) {
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
        this.observer.next(new ObservableData(ChaincodeBaseServiceEvent.INITED, stub));
        return shim.success();
    }

    public async Invoke(stub: ChaincodeStub): Promise<ChaincodeResponse> {
        this.observer.next(new ObservableData(ChaincodeBaseServiceEvent.INVOKE_STARTED, stub));

        let response = await this.transport.invokeChaincode(stub);
        let type = ExtendedError.instanceOf(response.response) ? ChaincodeBaseServiceEvent.INVOKE_ERROR : ChaincodeBaseServiceEvent.INVOKE_COMPLETE;
        this.observer.next(new ObservableData(type, response));
        this.observer.next(new ObservableData(ChaincodeBaseServiceEvent.INVOKE_FINISHED, stub));
        return shim.success(TransformUtil.fromClassBuffer(response));
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get events(): Observable<ObservableData<T | ChaincodeBaseServiceEvent, ChaincodeStub | ExtendedError | TransportFabricResponsePayload>> {
        return this.observer.asObservable();
    }

    public abstract get name(): string;
}

export enum ChaincodeBaseServiceEvent {
    INITED = 'INITED',

    INVOKE_ERROR = 'INVOKE_ERROR',
    INVOKE_STARTED = 'INVOKE_STARTED',
    INVOKE_COMPLETE = 'INVOKE_COMPLETE',
    INVOKE_FINISHED = 'INVOKE_FINISHED'
}

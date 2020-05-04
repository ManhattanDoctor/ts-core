import { ClassType } from 'class-transformer/ClassTransformer';
import { ChaincodeStub, Iterators } from 'fabric-shim';

export interface ITransportFabricStub {
    readonly stub: ChaincodeStub;

    readonly userId: string;
    readonly userPublicKey: string;

    getState<U>(key: string, type?: ClassType<U>, isNeedValidate?: boolean): Promise<U>;
    getStateRaw(key: string): Promise<string>;

    putState<U>(key: string, value: U, isNeedValidate?: boolean, isNeedTransform?: boolean): Promise<U>;
    putStateRaw(key: string, value: string): Promise<void>;

    hasState(key: string): Promise<boolean>;
    removeState(key: string): Promise<void>;
}

export interface ITransportFabricStubHolder {
    readonly stub: ITransportFabricStub;
}

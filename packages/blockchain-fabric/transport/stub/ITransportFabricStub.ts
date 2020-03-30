import { ClassType } from 'class-transformer/ClassTransformer';
import { ChaincodeStub } from 'fabric-shim';

export interface ITransportFabricStub {
    readonly userId: string;
    readonly userPublicKey: string;

    readonly stub: ChaincodeStub;
    readonly isSignatureVerified: boolean;

    hasState(key: string): Promise<boolean>;

    getState<U>(key: string, type?: ClassType<U>, isNeedValidate?: boolean): Promise<U>;

    putState<U>(key: string, value: U, isNeedValidate?: boolean, isNeedTransform?: boolean): Promise<U>;

    deleteState(key: string): Promise<void>;
}

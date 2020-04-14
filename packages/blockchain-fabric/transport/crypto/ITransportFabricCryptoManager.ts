export interface ITransportFabricCryptoManager {
    sign<U>(request: U, privateKey: string): string;
    verify<U>(request: U, signature: string, publicKey: string): boolean;

    readonly algorithm: TransportFabricCryptoAlgorithm;
}

export enum TransportFabricCryptoAlgorithm {
    ED25519 = 'ED25519'
}

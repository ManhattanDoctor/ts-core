export interface ITransportFabricCryptoManager {
    sign<U>(request: U, privateKey: string): string;
    verify<U>(request: U, signature: string, publicKey: string): boolean;
}

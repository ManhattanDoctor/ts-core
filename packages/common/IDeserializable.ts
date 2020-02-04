export abstract class IDeserializable<T = any> {
    abstract deserialize(data: T): void;
}

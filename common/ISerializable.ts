export abstract class ISerializable<T = any> {
    abstract serialize(): T;
}

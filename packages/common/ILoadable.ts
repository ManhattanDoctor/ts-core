export abstract class ILoadable<T = any> {
    abstract serialize(): T;
}

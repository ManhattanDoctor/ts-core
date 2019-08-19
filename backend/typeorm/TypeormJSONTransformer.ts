import { ValueTransformer } from 'typeorm';

export class TypeormJSONTransformer implements ValueTransformer {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private static _instance: TypeormJSONTransformer;

    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static get instance(): TypeormJSONTransformer {
        if (!TypeormJSONTransformer._instance) {
            TypeormJSONTransformer._instance = new TypeormJSONTransformer();
        }
        return TypeormJSONTransformer._instance;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public from<T>(data: string): T {
        return JSON.parse(data);
    }

    public to<T>(data: T): string {
        return JSON.stringify(data);
    }
}

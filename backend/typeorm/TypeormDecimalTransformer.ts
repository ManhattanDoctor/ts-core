import { ValueTransformer } from 'typeorm';

export class TypeormDecimalTransformer implements ValueTransformer {
    // --------------------------------------------------------------------------
    //
    //  Properties
    //
    // --------------------------------------------------------------------------

    private static _instance: TypeormDecimalTransformer;

    // --------------------------------------------------------------------------
    //
    //  Public Static Methods
    //
    // --------------------------------------------------------------------------

    public static get instance(): TypeormDecimalTransformer {
        if (!TypeormDecimalTransformer._instance) {
            TypeormDecimalTransformer._instance = new TypeormDecimalTransformer();
        }
        return TypeormDecimalTransformer._instance;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public to(data: number): number {
        return data;
    }

    public from(data: string): number {
        return parseFloat(data);
    }
}

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { AbstractSettingsStorage } from '@ts-core/common/settings';
import { IModeSettings, Mode } from './IModeSettings';

export class EnvSettingsStorage extends AbstractSettingsStorage implements IModeSettings {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(fileName: string = '.env') {
        super();

        try {
            this.data = dotenv.parse(fs.readFileSync(fileName));
        } catch (error) {
            this.data = {};
        } finally {
            this.envInitializedHandler();
        }
    }

    // --------------------------------------------------------------------------
    //
    //  Private Properties
    //
    // --------------------------------------------------------------------------

    protected getPrefferedValue<T>(name: string): T {
        return process.env[name] as any;
    }

    // --------------------------------------------------------------------------
    //
    //  Event Handlers
    //
    // --------------------------------------------------------------------------

    protected envInitializedHandler(): void {
        this.initializedHandler();
    }

    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public get mode(): Mode {
        return this.getValue('NODE_ENV');
    }

    public get isTesting(): boolean {
        return this.mode === Mode.TESTING;
    }

    public get isProduction(): boolean {
        return this.mode === Mode.PRODUCTION;
    }

    public get isDevelopment(): boolean {
        return this.mode === Mode.DEVELOPMENT;
    }
}

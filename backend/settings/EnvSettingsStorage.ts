import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { AbstractSettingsStorage } from './AbstractSettingsStorage';

export class EnvSettingsStorage extends AbstractSettingsStorage {
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
            this.initializedHandler();
        }
    }
}

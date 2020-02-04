export interface IModeSettings {
    readonly mode: Mode;
    readonly isTesting: boolean;
    readonly isProduction: boolean;
    readonly isDevelopment: boolean;
}

export enum Mode {
    TESTING = 'testing',
    PRODUCTION = 'production',
    DEVELOPMENT = 'development'
}

export interface IDatabaseSettings {
    readonly databaseUri?: string;
    readonly databaseHost: string;
    readonly databasePort: number;
    readonly databaseName: string;
    readonly databaseUserName: string;
    readonly databaseUserPassword: string;
}

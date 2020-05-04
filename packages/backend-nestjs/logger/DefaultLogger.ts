import { Logger } from '@nestjs/common';
import { LoggerLevel, LoggerWrapper } from '@ts-core/common/logger';
import * as clc from 'cli-color';
import * as _ from 'lodash';

export class DefaultLogger extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Public Properties
    //
    // --------------------------------------------------------------------------

    public isTimeDiffEnabled: boolean = true;

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(level: LoggerLevel, context?: any) {
        super(Logger, context, level);
        this.logger['printMessage'] = this.printMessage;
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private printMessage = (message: any, color: Function, context: string = '', isTimeDiffEnabled: boolean): void => {
        isTimeDiffEnabled = this.isTimeDiffEnabled;

        let output = _.isObject(message) ? `\n${JSON.stringify(message, null, 4)}\n` : color(message);
        let date = new Date();
        let timestamp = `${date
            .getHours()
            .toString()
            .padStart(2, '0')}:${date
            .getMinutes()
            .toString()
            .padStart(2, '0')}:${date
            .getSeconds()
            .toString()
            .padStart(2, '0')}:${date
            .getMilliseconds()
            .toString()
            .padStart(3, '0')}`;

        let contextMessage = !_.isNil(context) ? this.yellow(`[${context}] `) : '';
        let timestampDiff = this.updateAndGetTimestampDiff(isTimeDiffEnabled);
        process.stdout.write(`${timestamp} ${contextMessage}${output}${timestampDiff}\n`);
    };

    private updateAndGetTimestampDiff = (isTimeDiffEnabled: boolean): string => {
        let includeTimestamp = this.lastTimestamp && isTimeDiffEnabled;
        let result = includeTimestamp ? this.yellow(` +${Date.now() - this.lastTimestamp}ms`) : '';
        this.lastTimestamp = Date.now();
        return result;
    };

    // --------------------------------------------------------------------------
    //
    //  Private Properties
    //
    // --------------------------------------------------------------------------

    private get yellow(): (value: string) => string {
        return clc.xterm(3);
    }

    private get lastTimestamp(): number {
        return Logger['lastTimestamp'];
    }

    private set lastTimestamp(value: number) {
        Logger['lastTimestamp'] = value;
    }
}

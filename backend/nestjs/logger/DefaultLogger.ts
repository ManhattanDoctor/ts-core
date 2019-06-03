import { Logger } from '@nestjs/common';

export class DefaultLogger extends Logger {
    constructor() {
        super();
    }
}

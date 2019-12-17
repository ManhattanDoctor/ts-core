
import { ModuleRef } from '@nestjs/core';
import * as _ from 'lodash';

let applicationInjector: ModuleRef;

export const APPLICATION_INJECTOR = (value?: ModuleRef): ModuleRef => {
    if (!_.isNil(value)) {
        applicationInjector = value;
    }
    return applicationInjector;
};

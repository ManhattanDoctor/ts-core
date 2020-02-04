import { Injector } from '@angular/core';
import * as _ from 'lodash';

let applicationInjector: Injector;

export const APPLICATION_INJECTOR = (value?: Injector): Injector => {
    if (!_.isNil(value)) {
        applicationInjector = value;
    }
    return applicationInjector;
};

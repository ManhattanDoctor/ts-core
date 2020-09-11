import { ClassType } from 'class-transformer/ClassTransformer';
import * as _ from 'lodash';
import { ValidatorOptions } from 'class-validator';
import { ValidateUtil, TransformUtil } from '../util';

export const ValidateResult = <U>(classType?: ClassType<U>, options?: ValidatorOptions): any => {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let originalMethod = descriptor.value;
        descriptor.value = async function(...args): Promise<any> {
            let value = originalMethod.apply(this, args);

            let item = value instanceof Promise ? await value : value;
            if (!_.isNil(classType)) {
                item = TransformUtil.toClass(classType, value);
            }
            ValidateUtil.validate(item, true, options);
            return value;
        };
    };
};

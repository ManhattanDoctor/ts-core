import { IFilterable } from './IFilterable';
import { IPage } from './IPage';

export interface IPaginable<U> extends IFilterable<U>, IPage {}

import { IFilterableCondition } from '@ts-core/common/dto';
import { ObjectUtil } from '@ts-core/common/util';
import * as _ from 'lodash';

export class SmartTableDataColumn<U> {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    public name: keyof U;
    public sort?: boolean;
    public class?: string;
    public title?: string;
    public filter?: any;

    public filterFunction?: (value: any) => IFilterableCondition<U>;
    public valuePrepareFunction?: (value: any, data: U) => string;

    public titleId?: string;
    public titleTranslation?: any;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(name: keyof U) {
        this.name = name;
    }

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public clone(properties: { [P in keyof SmartTableDataColumn<U>]?: any }): SmartTableDataColumn<U> {
        if (_.isNil(properties)) {
            properties = {};
        }
        let item = new SmartTableDataColumn(this.name);
        let copyProperties = ['sort', 'class', 'filter', 'filterFunction', 'valuePrepareFunction', 'titleId', 'titleTranslation'];
        for (let name of copyProperties) {
            item[name] = ObjectUtil.hasOwnProperty(properties, name) ? properties[name] : this[name];
        }
        return item;
    }
}

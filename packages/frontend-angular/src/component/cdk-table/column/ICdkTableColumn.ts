export interface ICdkTableColumn<U = any> {
    name: keyof U;
    format?: ICdkTableColumnValueFunction<U>;
    className?: ICdkTableColumnClassNameFunction<U> | string;
    styleName?: ICdkTableColumnStyleNameFunction<U>;

    headerId?: string;
    headerClassName?: string;
    headerStyleName?: string;

    isMultiline?: boolean;
    isDisableSort?: boolean;
}

export type ICdkTableColumnValueFunction<U> = (item: U, column: ICdkTableColumn<U>) => U[keyof U] | string | number;
export type ICdkTableColumnClassNameFunction<U> = (item: U, column: ICdkTableColumn<U>) => string;
export type ICdkTableColumnStyleNameFunction<U> = (item: U, column: ICdkTableColumn<U>) => { [key: string]: string };

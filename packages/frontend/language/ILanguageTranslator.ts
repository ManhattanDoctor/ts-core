import { IDestroyable } from '@ts-core/common';
import { ExtendedError } from '@ts-core/common/error';
import { ObservableData } from '@ts-core/common/observer';
import { Observable } from 'rxjs';

export interface ILanguageTranslator extends IDestroyable {
    compile(item: ILanguageTranslatorItem): string;
    translate(item: ILanguageTranslatorItem): string;
    setLocale(locale: string, rawTranslation: any): void;
    isHasTranslation(key: string): boolean;

    readonly events: Observable<ObservableData<LanguageTranslatorEvent, ExtendedError>>;
}
export interface ILanguageTranslatorItem<T = any> {
    key?: string;
    params?: T;
}

export enum LanguageTranslatorEvent {
    KEY_INVALID = 'KEY_INVALID',
    KEY_UNDEFINED = 'KEY_UNDEFINED',
    KEY_NOT_FOUND = 'KEY_NOT_FOUND',
    LOCALE_UNDEFINED = 'LOCALE_UNDEFINED'
}

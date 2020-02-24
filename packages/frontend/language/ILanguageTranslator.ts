import { IDestroyable } from '@ts-core/common';
import { ExtendedError } from '@ts-core/common/error';
import { ObservableData } from '@ts-core/common/observer';
import { Observable } from 'rxjs';

export interface ILanguageTranslator extends IDestroyable {
    compile(expression: string, params?: any): string;
    translate(key: string, params?: any): string;
    setLocale(locale: string, rawTranslation: any): void;
    isHasTranslation(key: string): boolean;

    readonly events: Observable<ObservableData<LanguageTranslatorEvent, ExtendedError>>;
}

export enum LanguageTranslatorEvent {
    INVALID_KEY = 'INVALID_KEY',
    INVALID_LOCALE = 'INVALID_LOCALE',
    INVALID_EXPRESSION = 'INVALID_EXPRESSION',
    COMPILE_ERROR = 'COMPILE_ERROR'
}

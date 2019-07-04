import { Observable } from 'rxjs';
import { IDestroyable } from '../../../common';
import { ObservableData } from '../../../common/observer';

export interface ILanguageTranslator extends IDestroyable {
    compile(expression: string, params?: any): string;
    translate(key: string, params?: any): string;
    setLocale(locale: string, rawTranslation: any): void;
    isHasTranslation(key: string): boolean;

    readonly events: Observable<ObservableData<LanguageTranslatorEvent, Error>>;
}

export enum LanguageTranslatorEvent {
    UNDEFINED_KEY = 'UNDEFINED_KEY',
    PARSE_ERROR = 'PARSE_ERROR'
}

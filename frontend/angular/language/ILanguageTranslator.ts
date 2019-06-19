import { Observable } from 'rxjs';
import { IDestroyable } from '../../../common';
import { ObservableData } from '../../../common/observer';

export interface ILanguageTranslator extends IDestroyable {
    translate(key: string, params?: any): string;
    setLocale(locale: string, rawTranslation: any): void;
    isHasTranslation(key: string): boolean;

    readonly events: Observable<ObservableData<LanguageTranslatorEvent, Error>>;
}

export enum LanguageTranslatorEvent {
    PARSE_ERROR = 'PARSE_ERROR'
}

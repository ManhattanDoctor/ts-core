import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { DestroyableContainer, LoadableEvent } from '@ts-core/common';
import { LanguageService } from '../language';
import { CamelCasePipe, MomentDateAdaptivePipe, MomentDatePipe, MomentTimePipe, SanitizePipe, TruncatePipe, MomentDateFromNowPipe } from '../pipe';
import { FinancePipe } from '../pipe/FinancePipe';

export class PipeBaseService extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    // 	Constants
    //
    // --------------------------------------------------------------------------

    private static DATE: DatePipe = null;
    private static FINANCE: FinancePipe = null;
    private static TRUNCATE: TruncatePipe = null;
    private static SANITIZE: SanitizePipe = null;

    private static CAMEL_CASE: CamelCasePipe = null;

    private static MOMENT_TIME: MomentTimePipe = null;
    private static MOMENT_DATE: MomentDatePipe = null;
    private static MOMENT_DATE_FROM_NOW: MomentDateFromNowPipe = null;
    private static MOMENT_ADAPTIVE_DATE: MomentDateAdaptivePipe = null;

    // --------------------------------------------------------------------------
    //
    // 	Properties
    //
    // --------------------------------------------------------------------------

    private _locale: string;

    // --------------------------------------------------------------------------
    //
    // 	Constructor
    //
    // --------------------------------------------------------------------------

    constructor(public language: LanguageService, public sanitizer: DomSanitizer) {
        super();

        if (this.language.isLoaded) {
            this.commitLanguageProperties();
        }
        this.addSubscription(
            this.language.events.subscribe(data => {
                if (data.type === LoadableEvent.COMPLETE) {
                    this.commitLanguageProperties();
                }
            })
        );
    }

    // --------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    // --------------------------------------------------------------------------

    protected commitLanguageProperties(): void {
        let locale = this.language.locale ? this.language.language.locale : 'en';
        this._locale = locale === 'en' ? 'en-US' : locale;

        if (PipeBaseService.DATE) {
            PipeBaseService.DATE = new DatePipe(this.locale);
        }
    }

    // --------------------------------------------------------------------------
    //
    // 	Public Properties
    //
    // --------------------------------------------------------------------------

    public get date(): DatePipe {
        if (!PipeBaseService.DATE) {
            PipeBaseService.DATE = new DatePipe(this.locale);
        }
        return PipeBaseService.DATE;
    }

    public get finance(): FinancePipe {
        if (!PipeBaseService.FINANCE) {
            PipeBaseService.FINANCE = new FinancePipe();
        }
        return PipeBaseService.FINANCE;
    }

    public get truncate(): TruncatePipe {
        if (!PipeBaseService.TRUNCATE) {
            PipeBaseService.TRUNCATE = new TruncatePipe();
        }
        return PipeBaseService.TRUNCATE;
    }

    public get momentDate(): MomentDatePipe {
        if (!PipeBaseService.MOMENT_DATE) {
            PipeBaseService.MOMENT_DATE = new MomentDatePipe();
        }
        return PipeBaseService.MOMENT_DATE;
    }

    public get momentDateFromNow(): MomentDateFromNowPipe {
        if (!PipeBaseService.MOMENT_DATE_FROM_NOW) {
            PipeBaseService.MOMENT_DATE_FROM_NOW = new MomentDateFromNowPipe();
        }
        return PipeBaseService.MOMENT_DATE_FROM_NOW;
    }

    public get momentDateAdaptive(): MomentDateAdaptivePipe {
        if (!PipeBaseService.MOMENT_ADAPTIVE_DATE) {
            PipeBaseService.MOMENT_ADAPTIVE_DATE = new MomentDateAdaptivePipe();
        }
        return PipeBaseService.MOMENT_ADAPTIVE_DATE;
    }

    public get momentTime(): MomentTimePipe {
        if (!PipeBaseService.MOMENT_TIME) {
            PipeBaseService.MOMENT_TIME = new MomentTimePipe();
        }
        return PipeBaseService.MOMENT_TIME;
    }

    public get sanitize(): SanitizePipe {
        if (!PipeBaseService.SANITIZE) {
            PipeBaseService.SANITIZE = new SanitizePipe(this.sanitizer);
        }
        return PipeBaseService.SANITIZE;
    }

    public get camelCase(): CamelCasePipe {
        if (!PipeBaseService.CAMEL_CASE) {
            PipeBaseService.CAMEL_CASE = new CamelCasePipe();
        }
        return PipeBaseService.CAMEL_CASE;
    }

    public get locale(): string {
        return this._locale;
    }
}

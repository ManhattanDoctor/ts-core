import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { LoadableEvent } from '../../../common';
import { DestroyableContainer } from '../../../common';
import { LanguageService } from '../language';
import { MomentDateAdaptivePipe, MomentDatePipe, MomentTimePipe, SanitizePipe, TruncatePipe } from '../pipe';
import { FinancePipe } from '../pipe/FinancePipe';

export class PipeBaseService extends DestroyableContainer {
    // --------------------------------------------------------------------------
    //
    // 	Constants
    //
    // --------------------------------------------------------------------------

    private static DATE: DatePipe;
    private static FINANCE: FinancePipe;
    private static TRUNCATE: TruncatePipe;
    private static SANITIZE: SanitizePipe;

    private static MOMENT_TIME: MomentTimePipe;
    private static MOMENT_DATE: MomentDatePipe;
    private static MOMENT_ADAPTIVE_DATE: MomentDateAdaptivePipe;

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

    public get locale(): string {
        return this._locale;
    }
}

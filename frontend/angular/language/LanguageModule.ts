import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { LanguageMatPaginatorIntl } from './LanguageMatPaginatorIntl';
import { LanguagePipe } from './LanguagePipe';
import { LanguageResolver } from './LanguageResolver';
import { LanguageService } from './LanguageService';

@NgModule({
    imports: [HttpClientModule],
    declarations: [LanguagePipe],
    providers: [LanguageService, LanguageResolver, LanguageMatPaginatorIntl],
    exports: [LanguagePipe]
})
export class LanguageModule {}

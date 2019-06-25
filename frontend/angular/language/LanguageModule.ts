import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { LanguageMatPaginatorIntl } from './LanguageMatPaginatorIntl';
import { LanguagePipe } from './LanguagePipe';
import { LanguagePurePipe } from './LanguagePurePipe';
import { LanguageResolver } from './LanguageResolver';
import { LanguageService } from './LanguageService';

@NgModule({
    imports: [HttpClientModule],
    declarations: [LanguagePipe, LanguagePurePipe],
    providers: [LanguageService, LanguageResolver, LanguageMatPaginatorIntl],
    exports: [LanguagePipe, LanguagePurePipe]
})
export class LanguageModule {}

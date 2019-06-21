import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { LanguageMatPaginatorIntl } from './LanguageMatPaginatorIntl';
import { LanguagePipe } from './LanguagePipe';
import { LanguagePipePure } from './LanguagePipePure';
import { LanguageResolver } from './LanguageResolver';
import { LanguageService } from './LanguageService';

@NgModule({
    imports: [HttpClientModule],
    declarations: [LanguagePipe, LanguagePipePure],
    providers: [LanguageService, LanguageResolver, LanguageMatPaginatorIntl],
    exports: [LanguagePipe, LanguagePipePure]
})
export class LanguageModule {}

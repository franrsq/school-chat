import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslateConfigService {

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang(this.translate.getBrowserLang());
  }

  getDefaultLanguage() {
    return this.translate.getDefaultLang();
  }

  setLanguage(setLang) {
    this.translate.use(setLang);
  }
}

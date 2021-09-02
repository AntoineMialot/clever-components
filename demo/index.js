import {updateRootContext} from '../src/lib/smart-manager.js'
// Setup langs and configure english
import { addTranslations, setLanguage } from '../src/lib/i18n.js';
import { lang, translations } from '../src/translations/translations.en.js';
import '../src/saas/cc-grafana-info.smart.js';

addTranslations(lang, translations);
setLanguage(lang);

const apiConfig = JSON.parse(localStorage.getItem('cc-tokens'));

updateRootContext({ apiConfig });
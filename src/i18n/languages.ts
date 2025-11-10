// Import date-fns locales
import { da } from "date-fns/locale/da";
import { de } from "date-fns/locale/de";
import { el } from "date-fns/locale/el";
import { enGB } from "date-fns/locale/en-GB";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
import { fr } from "date-fns/locale/fr";
import { gl } from "date-fns/locale/gl";
import { he } from "date-fns/locale/he";
import { it } from "date-fns/locale/it";
import { nl } from "date-fns/locale/nl";
import { pl } from "date-fns/locale/pl";
import { sl } from "date-fns/locale/sl";
import { sv } from "date-fns/locale/sv";
import { tr } from "date-fns/locale/tr";
import { zhCN } from "date-fns/locale/zh-CN";
import { zhTW } from "date-fns/locale/zh-TW";

/*
 * JSON object that contains all available languages and the following information:
 * code: language code (has to be the same as in i18n.js)
 * long: name of the language
 * rtl: is the reading direction right to left?
 * dateLocale: is needed for translation in datepicker
 *
 * !!! If a translation file of a new language was added, please insert these language here, too !!!
 */
const languages = [
	{ code: "en-US", long: "English (US)", rtl: false, dateLocale: enUS },
	{ code: "en-GB", long: "English (UK)", rtl: false, dateLocale: enGB },
	{ code: "da", long: "Dansk", rtl: false, dateLocale: da },
	{ code: "de", long: "Deutsch", rtl: false, dateLocale: de },
	{ code: "el", long: "Ελληνικά", rtl: false, dateLocale: el },
	{ code: "es", long: "Español", rtl: false, dateLocale: es },
	{ code: "fr", long: "Français", rtl: false, dateLocale: fr },
	{ code: "gl", long: "Galego", rtl: false, dateLocale: gl },
	{ code: "he", long: "עברית", rtl: true, dateLocale: he },
	{ code: "it", long: "Italiano", rtl: false, dateLocale: it },
	{ code: "nl", long: "Nederlands", rtl: false, dateLocale: nl },
	{ code: "pl", long: "Polski", rtl: false, dateLocale: pl },
	{ code: "sl", long: "Slovenščina", rtl: false, dateLocale: sl },
	{ code: "sv", long: "Svenska", rtl: false, dateLocale: sv },
	{ code: "tr", long: "Türkçe", rtl: false, dateLocale: tr },
	{ code: "zh-CN", long: "简体中文", rtl: false, dateLocale: zhCN },
	{ code: "zh-TW", long: "繁體中文", rtl: false, dateLocale: zhTW },
];

export default languages;

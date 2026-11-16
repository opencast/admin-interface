import i18n, { BackendModule, FormatterModule } from "i18next";
import { initReactI18next } from "react-i18next";

import LanguageDetector from "i18next-browser-languagedetector";

// The translation of the default language is part of the bundle, as it is also the fallback for all other languages
import enUSTrans from "./org/opencastproject/adminui/languages/lang-en_US.json";
import { getCurrentLanguageInformation } from "../utils/utils";
import { format as dateFnsFormat } from "date-fns/format";

// Assignment of language code to translation file, which is only loaded once the language is used
// !!! If translation file of a new language is added, please add assignment here, too !!!
const translations: Record<string, () => Promise<{ default: object }>> = {
	"en-GB": () => import("./org/opencastproject/adminui/languages/lang-en_GB.json"),
	da: () => import("./org/opencastproject/adminui/languages/lang-da_DK.json"),
	de: () => import("./org/opencastproject/adminui/languages/lang-de_DE.json"),
	el: () => import("./org/opencastproject/adminui/languages/lang-el_GR.json"),
	es: () => import("./org/opencastproject/adminui/languages/lang-es_ES.json"),
	fr: () => import("./org/opencastproject/adminui/languages/lang-fr_FR.json"),
	gl: () => import("./org/opencastproject/adminui/languages/lang-gl_ES.json"),
	he: () => import("./org/opencastproject/adminui/languages/lang-he_IL.json"),
	it: () => import("./org/opencastproject/adminui/languages/lang-it_IT.json"),
	nl: () => import("./org/opencastproject/adminui/languages/lang-nl_NL.json"),
	pl: () => import("./org/opencastproject/adminui/languages/lang-pl_PL.json"),
	sl: () => import("./org/opencastproject/adminui/languages/lang-sl_SI.json"),
	sv: () => import("./org/opencastproject/adminui/languages/lang-sv_SE.json"),
	tr: () => import("./org/opencastproject/adminui/languages/lang-tr_TR.json"),
	"zh-CN": () => import("./org/opencastproject/adminui/languages/lang-zh_CN.json"),
	"zh-TW": () => import("./org/opencastproject/adminui/languages/lang-zh_TW.json"),
};

// Loads the translation file of a language when i18next asks for it
const translationBackend: BackendModule = {
	type: "backend",
	init() { },
	read(language, _namespace, callback) {
		const load = translations[language];
		// Nothing to load for regions of a language, like "de-CH", as they fall back to the language itself
		if (!load) {
			callback(null, {});
			return;
		}
		load().then(
			translation => callback(null, translation.default),
			(error: Error) => callback(error, null),
		);
	},
};

const myFormatter: FormatterModule = {
	type: "formatter",
	init(_services, _i18nextOptions) {},
	format(value, format, lng, _options) {
		if (value instanceof Date && format && lng) {
			return dateFnsFormat(value, format, {
				locale: getCurrentLanguageInformation(lng)?.dateLocale,
			});
		}

		// If we are given any by the package, we can only really return any
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return value;
	},
	add(_name, _fc) { },
	addCached(_name, _fc) { },
};

// Configuration of i18next
// The promise resolves as soon as the translations of the language of the user are available
export const i18nReady = i18n
	.use(translationBackend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.use(myFormatter)
	.init({
		resources: { "en-US": { translation: enUSTrans } },
		// Without this, i18next would not load the other languages with the backend
		partialBundledLanguages: true,
		fallbackLng: "en-US",
		debug: false,

		interpolation: {
			escapeValue: false,
			alwaysFormat: true,
		},

		react: {
			useSuspense: false,
		},
	});

export default i18n;

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import moment from "moment";

import HttpBackend, { HttpBackendOptions } from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

// import language files
import enUSTrans from "./org/opencastproject/adminui/languages/lang-en_US.json";
import enGBTrans from "./org/opencastproject/adminui/languages/lang-en_GB.json";
import daDKTrans from "./org/opencastproject/adminui/languages/lang-da_DK.json";
import deDETrans from "./org/opencastproject/adminui/languages/lang-de_DE.json";
import elGRTrans from "./org/opencastproject/adminui/languages/lang-el_GR.json";
import esESTrans from "./org/opencastproject/adminui/languages/lang-es_ES.json";
import frFRTrans from "./org/opencastproject/adminui/languages/lang-fr_FR.json";
import glESTrans from "./org/opencastproject/adminui/languages/lang-gl_ES.json";
import heILTrans from "./org/opencastproject/adminui/languages/lang-he_IL.json";
import itITTrans from "./org/opencastproject/adminui/languages/lang-it_IT.json";
import nlNLTrans from "./org/opencastproject/adminui/languages/lang-nl_NL.json";
import plPLTrans from "./org/opencastproject/adminui/languages/lang-pl_PL.json";
import slSITrans from "./org/opencastproject/adminui/languages/lang-sl_SI.json";
import svSETrans from "./org/opencastproject/adminui/languages/lang-sv_SE.json";
import trTRTrans from "./org/opencastproject/adminui/languages/lang-tr_TR.json";
import zhCNTrans from "./org/opencastproject/adminui/languages/lang-zh_CN.json";
import zhTWTrans from "./org/opencastproject/adminui/languages/lang-zh_TW.json";

// Assignment of language code to translation file
// !!! If translation file of a new language is added, please add assignment here, too !!!
const resources = {
	"en-US": { translation: enUSTrans },
	"en-GB": { translation: enGBTrans },
	da: { translation: daDKTrans },
	de: { translation: deDETrans },
	el: { translation: elGRTrans },
	es: { translation: esESTrans },
	fr: { translation: frFRTrans },
	gl: { translation: glESTrans },
	he: { translation: heILTrans },
	it: { translation: itITTrans },
	nl: { translation: nlNLTrans },
	pl: { translation: plPLTrans },
	sl: { translation: slSITrans },
	sv: { translation: svSETrans },
	tr: { translation: trTRTrans },
	"zh-CN": { translation: zhCNTrans },
	"zh-TW": { translation: zhTWTrans },
} as const;

// Configuration of i18next
i18n
	.use(HttpBackend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init<HttpBackendOptions>({
		resources,
		fallbackLng: "en-US",
		debug: false,

		interpolation: {
			escapeValue: false,
			format: function (value, format, _lng) {
				if (value instanceof Date) {
					return moment(value).format(format);
				}

				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return value;
			},
		},
		react: {
			useSuspense: false,
		},
	});

export default i18n;

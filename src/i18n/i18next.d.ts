// import the original type declarations
import "i18next";

// import all namespaces (for the default language, only)
import translation from "./org/opencastproject/adminui/languages/lang-en_US.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      translation: typeof translation;
    };
  }
}

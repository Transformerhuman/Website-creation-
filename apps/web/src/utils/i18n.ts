import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "Latest Updates": "Latest Updates",
          "Live Weather": "Live Weather",
          "nav": {
            "news": "News",
            "advice": "Advice",
            "market": "Market",
            "schemes": "Schemes",
            "corporate": "Corporate",
            "contact": "Contact"
          }
        }
      },
      ne: {
        translation: {
          "Latest Updates": "ताजा अपडेटहरू",
          "Live Weather": "ताजा मौसम",
          "nav": {
            "news": "समाचार",
            "advice": "परामर्श",
            "market": "बजार",
            "schemes": "योजना",
            "corporate": "कर्पोरेट",
            "contact": "सम्पर्क"
          }
        }
      }
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import vi from './locales/vi';
import en from './locales/en';

/**
 * F.1.2 — Khởi tạo i18next. Ưu tiên ngôn ngữ đã lưu trong localStorage (key `i18nextLng`), nếu
 * chưa từng chọn thì tự phát hiện theo ngôn ngữ trình duyệt, cuối cùng mặc định Tiếng Việt (BR-03).
 * `load: 'languageOnly'` để i18n.language luôn là "vi"/"en" (bỏ vùng miền, vd "en-US" -> "en"),
 * dùng trực tiếp cho header Accept-Language (xem axiosClient.ts).
 */
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en },
    },
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en'],
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;

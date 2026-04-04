import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhTW from './locales/zh-TW.json';
import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import pl from './locales/pl.json';
import ru from './locales/ru.json';
import vi from './locales/vi.json';
import pt from './locales/pt.json';
import it from './locales/it.json';
import nl from './locales/nl.json';
import cs from './locales/cs.json';
import sv from './locales/sv.json';
import th from './locales/th.json';
import id from './locales/id.json';
import es from './locales/es.json';
import zhCN from './locales/zh-CN.json';

export const supportedLangs = ['zh-TW', 'en', 'de', 'fr', 'ja', 'ko', 'pl', 'ru', 'vi', 'pt', 'it', 'nl', 'cs', 'sv', 'th', 'id', 'es', 'zh-CN'];
export const defaultLang = 'zh-TW';

export const localeLabels = {
  'zh-TW': '繁體中文',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  ja: '日本語',
  ko: '한국어',
  pl: 'Polski',
  ru: 'Русский',
  vi: 'Tiếng Việt',
  pt: 'Português',
  it: 'Italiano',
  nl: 'Nederlands',
  cs: 'Čeština',
  sv: 'Svenska',
  th: 'ไทย',
  id: 'Bahasa Indonesia',
  es: 'Español',
  'zh-CN': '简体中文',
};

export const localeData = {
  'zh-TW': zhTW,
  en,
  de,
  fr,
  ja,
  ko,
  pl,
  ru,
  vi,
  pt,
  it,
  nl,
  cs,
  sv,
  th,
  id,
  es,
  'zh-CN': zhCN,
};

const resources = Object.fromEntries(
  Object.entries(localeData).map(([lang, data]) => [lang, { translation: data }]),
);

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLang,
  fallbackLng: defaultLang,
  interpolation: { escapeValue: false },
});

export function normalizeLang(lang) {
  return supportedLangs.includes(lang) ? lang : defaultLang;
}

export function getPathWithoutLang(pathname) {
  return pathname.replace(/^\/(?:zh-TW|en|de|fr|ja|ko|pl|ru|vi|pt|it|nl|cs|sv|th|id|es|zh-CN)(?=\/|$)/, '') || '/';
}

export function buildCanonical(lang, pathname) {
  return `${window.location.origin}/${lang}${getPathWithoutLang(pathname)}`.replace(/\/$/, '');
}

export function applySeo(lang, pathname) {
  const { title, description, ogTitle, ogDescription } = localeData[lang].seo;
  const canonical = buildCanonical(lang, pathname);
  document.title = title;

  const ensureTag = (selector, create) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = create();
      document.head.appendChild(el);
    }
    return el;
  };

  ensureTag('meta[name="description"]', () => {
    const meta = document.createElement('meta');
    meta.name = 'description';
    return meta;
  }).content = description;

  ensureTag('link[rel="canonical"]', () => {
    const link = document.createElement('link');
    link.rel = 'canonical';
    return link;
  }).href = canonical;

  const setMeta = (property, content) => {
    ensureTag(`meta[property="${property}"]`, () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', property);
      return meta;
    }).content = content;
  };

  setMeta('og:title', ogTitle || title);
  setMeta('og:description', ogDescription || description);
  setMeta('og:type', 'website');
  setMeta('og:url', canonical);

  supportedLangs.forEach((code) => {
    ensureTag(`link[rel="alternate"][hreflang="${code}"]`, () => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = code;
      return link;
    }).href = `${window.location.origin}/${code}${getPathWithoutLang(pathname)}`.replace(/\/$/, '');
  });
}

export default i18n;

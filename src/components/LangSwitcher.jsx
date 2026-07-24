import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { gameSlug, getPathSuffix, localeLabels, persistLangPreference, supportedLangs } from '../i18n';

export default function LangSwitcher() {
  const { lang } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <select
      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      value={lang}
      onChange={(e) => {
        const nextLang = e.target.value;
        const suffix = getPathSuffix(location.pathname);
        persistLangPreference(nextLang); // 記住使用者手動選的語言，優先權高於 IP 地區猜測
        navigate(`/${gameSlug}/${nextLang}${suffix}`, { replace: true });
      }}
    >
      {supportedLangs.map((code) => (
        <option key={code} value={code}>
          {localeLabels[code]}
        </option>
      ))}
    </select>
  );
}

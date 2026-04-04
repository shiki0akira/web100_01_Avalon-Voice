import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getPathWithoutLang, localeLabels, supportedLangs } from '../i18n';

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
        const rest = getPathWithoutLang(location.pathname);
        navigate(`/${nextLang}${rest}`, { replace: true });
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

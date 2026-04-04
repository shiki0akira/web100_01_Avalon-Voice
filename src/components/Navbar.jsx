import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { defaultLang, normalizeLang } from '../i18n';
import LangSwitcher from './LangSwitcher';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { lang } = useParams();
  const { t } = useTranslation();

  const effectiveLang = normalizeLang(lang) || defaultLang;

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 p-4">
        <Link to={`${effectiveLang}`} className="font-bold">
          {t('nav.title')}
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to={`${effectiveLang}/rules`}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            {t('nav.rules')}
          </Link>
          <LangSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

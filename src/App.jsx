import React, { useEffect, useMemo } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from './context/ThemeContext';
import { GameProvider } from './context/GameContext';
import { applySeo, defaultLang, getAppBasePathFromPathname, getPathWithoutLang, normalizeLang } from './i18n';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Game from './pages/Game';
import Rules from './pages/Rules';

function LangLayout() {
  const { lang } = useParams();
  const location = useLocation();
  const { i18n } = useTranslation();

  const safeLang = normalizeLang(lang);

  useEffect(() => {
    if (i18n.language !== safeLang) {
      i18n.changeLanguage(safeLang);
    }
    document.documentElement.lang = safeLang;
    applySeo(safeLang, location.pathname);
  }, [i18n, location.pathname, safeLang]);

  const subPath = getPathWithoutLang(location.pathname);

  let page = <Home />;
  if (subPath === '/game') page = <Game />;
  else if (subPath === '/rules') page = <Rules />;

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      {page}
    </div>
  );
}

export default function App() {
  const routerBasename = useMemo(() => getAppBasePathFromPathname(window.location.pathname), []);

  return (
    <ThemeProvider>
      <GameProvider>
        <BrowserRouter basename={routerBasename}>
          <Routes>
            <Route path="/" element={<LangLayout />} />
            <Route path=":lang/*" element={<LangLayout />} />
            <Route path="*" element={<LangLayout />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </ThemeProvider>
  );
}

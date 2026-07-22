import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from './context/ThemeContext';
import { GameProvider } from './context/GameContext';
import { applySeo, defaultLang, getPathWithoutLang, normalizeLang, supportedLangs } from './i18n';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Game from './pages/Game';
import Rules from './pages/Rules';

function LangLayout() {
  const { lang } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const safeLang = normalizeLang(lang);

  useEffect(() => {
    if (safeLang !== lang) {
      navigate(`/${defaultLang}${getPathWithoutLang(location.pathname)}`, { replace: true });
      return;
    }
    if (i18n.language !== safeLang) {
      i18n.changeLanguage(safeLang);
    }
    document.documentElement.lang = safeLang;
    applySeo(safeLang, location.pathname);
  }, [i18n, lang, location.pathname, navigate, safeLang]);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="game" element={<Game />} />
        <Route path="rules" element={<Rules />} />
        <Route path="*" element={<Navigate to={`/${safeLang}/avalon`} replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to={`/${defaultLang}/avalon`} replace />} />
            <Route path=":lang/avalon/*" element={<LangLayout />} />
            <Route path="*" element={<Navigate to={`/${defaultLang}/avalon`} replace />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </ThemeProvider>
  );
}

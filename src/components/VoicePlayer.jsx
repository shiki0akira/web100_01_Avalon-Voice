import React from 'react';
import { useTranslation } from 'react-i18next';

export default function VoicePlayer({
  text,
  onSpeak,
  supported,
  rate,
  setRate,
  pause,
  resume,
  restart,
}) {
  const { t } = useTranslation();
  const speeds = [0.5, 0.75, 1, 1.25, 1.5];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50"
          disabled={!supported}
          onClick={() => onSpeak(text)}
        >
          Speak
        </button>

        <label className="inline-flex items-center gap-2">
          <span className="text-sm">{t('voice.speed')}</span>
          <select
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={rate}
            disabled={!supported}
            onChange={(e) => setRate(Number(e.target.value))}
          >
            {speeds.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50"
          disabled={!supported}
          onClick={pause}
        >
          {t('voice.pause')}
        </button>

        <button
          type="button"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50"
          disabled={!supported}
          onClick={resume}
        >
          {t('voice.resume')}
        </button>

        <button
          type="button"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50"
          disabled={!supported}
          onClick={restart}
        >
          {t('voice.restart')}
        </button>
      </div>
    </div>
  );
}

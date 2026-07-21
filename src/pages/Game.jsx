import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSpeech } from '../hooks/useSpeech';
import VoicePlayer from '../components/VoicePlayer';

const PAUSE_AFTER_MS = 1000;
const RECORDED_VOLUME_GAIN = 2;

export default function Game() {
  const { lang } = useParams();
  const { t } = useTranslation();
  const { state } = useLocation();
  const selectedRoles = state?.selectedRoles || [];

  const hasRole = useCallback((role) => selectedRoles.includes(role), [selectedRoles]);

  const [recordedAvailable, setRecordedAvailable] = useState(false);
  const [probeDone, setProbeDone] = useState(false);

  const {
    speak: speechSpeak,
    restart: speechRestart,
    pause: speechPause,
    resume: speechResume,
    rate,
    setRate,
    supported: speechSupported,
  } = useSpeech(lang);

  const rateRef = useRef(rate);
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    if (!lang) return;

    let cancelled = false;
    const probeSrc = `${import.meta.env.BASE_URL}audio/${lang}/1.mp3`;

    const probe = new Audio(probeSrc);
    let finished = false;

    const done = (v) => {
      if (cancelled || finished) return;
      finished = true;
      setRecordedAvailable(v);
      setProbeDone(true);
    };

    probe.addEventListener('canplaythrough', () => done(true), { once: true });
    probe.addEventListener('error', () => done(false), { once: true });

    const timeout = setTimeout(() => done(false), 2500);
    probe.load();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      try {
        probe.src = '';
      } catch {
        // ignore
      }
    };
  }, [lang]);

  const recorded = useMemo(() => {
    const oberonVariant = hasRole('oberon') ? 3 : 2;
    const mordredVariant = hasRole('mordred') ? 6 : 5;
    const includePercival = hasRole('percival');

    const steps = [
      { src: `${import.meta.env.BASE_URL}audio/${lang}/1.mp3`, waitAfterMs: PAUSE_AFTER_MS },
      { src: `${import.meta.env.BASE_URL}audio/${lang}/${oberonVariant}.mp3`, waitAfterMs: PAUSE_AFTER_MS },
      { src: `${import.meta.env.BASE_URL}audio/${lang}/4.mp3`, waitAfterMs: PAUSE_AFTER_MS },
      { src: `${import.meta.env.BASE_URL}audio/${lang}/${mordredVariant}.mp3`, waitAfterMs: PAUSE_AFTER_MS },
      { src: `${import.meta.env.BASE_URL}audio/${lang}/7.mp3`, waitAfterMs: PAUSE_AFTER_MS },
    ];

    if (includePercival) {
      steps.push({ src: `${import.meta.env.BASE_URL}audio/${lang}/8.mp3`, waitAfterMs: PAUSE_AFTER_MS });
      steps.push({ src: `${import.meta.env.BASE_URL}audio/${lang}/9.mp3`, waitAfterMs: 0 });
    }

    steps.push({ src: `${import.meta.env.BASE_URL}audio/${lang}/10.mp3`, waitAfterMs: 0 });

    return { steps };
  }, [hasRole, lang]);

  useEffect(() => {
    if (!recordedAvailable) return;
    if (typeof speechSpeak?.cancel === 'function') speechSpeak.cancel();
    try {
      window.speechSynthesis?.cancel?.();
    } catch {
      // ignore
    }
  }, [recordedAvailable, speechSpeak]);

  const rawScript = t('voice.script');
  const script = Array.isArray(rawScript) ? rawScript.join('\n') : (typeof rawScript === 'string' ? rawScript : JSON.stringify(rawScript));

  const audioRef = useRef(null);
  if (audioRef.current === null) audioRef.current = new Audio();

  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const mediaSourceRef = useRef(null);

  const runIdRef = useRef(0);
  const hasAutoStartedRef = useRef(false);
  const isWaitingRef = useRef(false);
  const delayTimerRef = useRef(null);
  const delayResolveRef = useRef(null);
  const delayRemainingRef = useRef(0);
  const delayStartedAtRef = useRef(0);

  const wait = useCallback(
    (ms) =>
      new Promise((resolve) => {
        if (ms <= 0) {
          resolve();
          return;
        }

        isWaitingRef.current = true;
        delayResolveRef.current = resolve;
        delayRemainingRef.current = ms;
        delayStartedAtRef.current = Date.now();

        delayTimerRef.current = setTimeout(() => {
          delayTimerRef.current = null;
          isWaitingRef.current = false;
          delayRemainingRef.current = 0;
          const r = delayResolveRef.current;
          delayResolveRef.current = null;
          r?.();
        }, ms);
      }),
    [],
  );

  const stopDelay = useCallback(() => {
    if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    delayTimerRef.current = null;
    isWaitingRef.current = false;
  }, []);

  const ensureRecordedAudioGraph = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;

    if (!audioCtxRef.current || !gainNodeRef.current || !mediaSourceRef.current) {
      const AudioContextImpl = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextImpl) return;

      const ctx = audioCtxRef.current || new AudioContextImpl();
      if (!audioCtxRef.current) audioCtxRef.current = ctx;

      if (!gainNodeRef.current) {
        gainNodeRef.current = ctx.createGain();
        gainNodeRef.current.gain.value = RECORDED_VOLUME_GAIN;
      }

      if (!mediaSourceRef.current) {
        mediaSourceRef.current = ctx.createMediaElementSource(a);
        mediaSourceRef.current.connect(gainNodeRef.current);
        gainNodeRef.current.connect(ctx.destination);
      }
    }

    try {
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    } catch {
      // ignore
    }
  }, []);

  const pauseRecorded = useCallback(() => {
    const a = audioRef.current;

    if (isWaitingRef.current && delayTimerRef.current) {
      const elapsed = Date.now() - delayStartedAtRef.current;
      const remaining = Math.max(0, delayRemainingRef.current - elapsed);
      delayRemainingRef.current = remaining;
      stopDelay();
      return;
    }

    try {
      a?.pause();
    } catch {
      // ignore
    }
  }, [stopDelay]);

  const resumeRecorded = useCallback(() => {
    const a = audioRef.current;

    if (isWaitingRef.current) {
      if (!delayResolveRef.current) return;
      const remaining = delayRemainingRef.current;
      if (remaining <= 0) return;

      isWaitingRef.current = true;
      delayStartedAtRef.current = Date.now();
      delayTimerRef.current = setTimeout(() => {
        delayTimerRef.current = null;
        isWaitingRef.current = false;
        delayRemainingRef.current = 0;
        const r = delayResolveRef.current;
        delayResolveRef.current = null;
        r?.();
      }, remaining);
      return;
    }

    try {
      ensureRecordedAudioGraph();
      a?.play();
    } catch {
      // ignore
    }
  }, [ensureRecordedAudioGraph]);

  const startRecorded = useCallback(() => {
    runIdRef.current += 1;
    const runId = runIdRef.current;

    const a = audioRef.current;
    try {
      ensureRecordedAudioGraph();
      a.pause();
      a.currentTime = 0;
      a.src = '';
      a.playbackRate = rateRef.current;
    } catch {
      // ignore
    }

    stopDelay();

    const run = async () => {
      for (let i = 0; i < recorded.steps.length; i += 1) {
        if (runId !== runIdRef.current) return;

        const step = recorded.steps[i];

        a.src = step.src;
        a.currentTime = 0;
        a.playbackRate = rateRef.current;

        await new Promise((resolve, reject) => {
          const cleanup = () => {
            a.removeEventListener('ended', onEnded);
            a.removeEventListener('error', onError);
          };

          const onEnded = () => {
            cleanup();
            resolve();
          };

          const onError = () => {
            cleanup();
            reject(new Error('audio error'));
          };

          a.addEventListener('ended', onEnded);
          a.addEventListener('error', onError);

          const p = a.play();
          if (p && typeof p.catch === 'function') {
            p.catch(() => {
              // ignore
            });
          }
        });

        if (runId !== runIdRef.current) return;
        await wait(step.waitAfterMs);
      }
    };

    run();
  }, [ensureRecordedAudioGraph, recorded.steps, stopDelay, wait]);

  const isRecordedMode = recordedAvailable;

  const pause = isRecordedMode ? pauseRecorded : speechPause;
  const resume = isRecordedMode ? resumeRecorded : speechResume;
  const restart = isRecordedMode ? startRecorded : speechRestart;
  const supported = isRecordedMode ? true : speechSupported;

  useEffect(() => {
    if (!probeDone) return;
    if (hasAutoStartedRef.current) return;
    hasAutoStartedRef.current = true;

    if (isRecordedMode) {
      startRecorded();
    } else {
      speechSpeak(t('voice.script'));
    }
  }, [probeDone, isRecordedMode, startRecorded, speechSpeak, t]);

  useEffect(() => {
    if (!isRecordedMode) return;
    const a = audioRef.current;
    try {
      a.playbackRate = rateRef.current;
    } catch {
      // ignore
    }
  }, [isRecordedMode, rate]);

  useEffect(() => {
    if (!isRecordedMode) return;
    return () => {
      const a = audioRef.current;
      try {
        a.pause();
        a.src = '';
      } catch {
        // ignore
      }

      try {
        audioCtxRef.current?.suspend?.();
      } catch {
        // ignore
      }
    };
  }, [isRecordedMode]);

  const onSpeak = useCallback(
    () => {
      if (isRecordedMode) startRecorded();
      else speechSpeak(t('voice.script'));
    },
    [isRecordedMode, speechSpeak, startRecorded, t],
  );

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-bold">{t('game.title')}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t('game.description')}</p>
        <p className="mt-4">{supported ? t('game.speaking') : t('game.unsupported')}</p>
        <div className="mt-4">
          <VoicePlayer
            text={script}
            onSpeak={onSpeak}
            supported={supported}
            rate={rate}
            setRate={setRate}
            pause={pause}
            resume={resume}
            restart={restart}
          />
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">{t('game.summary')}</h2>
        <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-100 p-4 text-sm dark:bg-slate-800">{script}</pre>
        <pre className="mt-3 overflow-auto rounded-xl bg-slate-100 p-4 text-sm dark:bg-slate-800">{JSON.stringify(state, null, 2)}</pre>
      </section>
    </main>
  );
}

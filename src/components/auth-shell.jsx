import { useEffect, useRef, useState } from 'react';
import { editorial, kicker, primaryButton } from '../constants/class-names';
import { BrandIcon } from './brand-icon.jsx';
import { SkipLink } from './skip-link.jsx';

export const authFormClass = 'flex w-full flex-col gap-6';

export const authSubmitClass = `${primaryButton} auth-submit w-full transition-colors duration-200 hover:bg-deep disabled:cursor-wait disabled:opacity-60 desk:ml-auto desk:w-auto`;

export function isEmailAddress(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function firstErrorId(errors, fields) {
  const match = fields.find(([key]) => errors[key]);
  return match ? match[1] : '';
}

export function useQueuedFocus() {
  const pendingId = useRef('');

  useEffect(() => {
    if (!pendingId.current) return undefined;
    const id = pendingId.current;
    pendingId.current = '';
    document.getElementById(id)?.focus();
    return undefined;
  });

  return (id) => {
    pendingId.current = id;
  };
}

export function usePreviewSubmit() {
  const [status, setStatus] = useState('idle');
  const [liveMessage, setLiveMessage] = useState('');
  const timer = useRef(0);
  const running = useRef(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const start = (message, onDone) => {
    if (running.current) return;
    running.current = true;
    setStatus('submitting');
    setLiveMessage(message);
    timer.current = window.setTimeout(() => {
      running.current = false;
      setStatus('idle');
      setLiveMessage('');
      onDone();
    }, 600);
  };

  return { status, liveMessage, start };
}

export function AuthShell({
  documentTitle,
  kickerText,
  title,
  emphasis,
  lede,
  facts,
  privacy,
  children,
}) {
  useEffect(() => {
    const previous = document.title;
    document.title = documentTitle;
    return () => {
      document.title = previous;
    };
  }, [documentTitle]);

  return (
    <>
      <SkipLink />
      <header className="relative z-20 flex h-17.5 items-center px-[5vw] desk:h-auto desk:min-h-20.5">
        <BrandIcon />
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        aria-labelledby="auth-title"
        className="grid grid-cols-1 items-center gap-[9vw] px-5 py-12 desk:min-h-[calc(100vh-82px)] desk:grid-cols-[0.82fr_1.18fr] desk:px-[clamp(24px,8vw,125px)] desk:py-20"
      >
        <div>
          <span className={kicker}>{kickerText}</span>
          <h1
            id="auth-title"
            className={`${editorial} mt-[17px] mb-6 text-[clamp(40px,6vw,54px)]`}
          >
            {title}
            <br />
            <em className="font-normal text-peach">{emphasis}</em>
          </h1>
          <p className="max-w-[480px] text-[13px] leading-[1.75] text-muted">
            {lede}
          </p>
          {facts?.length ? (
            <div className="my-[35px] grid grid-cols-2 gap-5 border-y border-line py-[22px]">
              {facts.map(([label, value]) => (
                <span key={label}>
                  <small className="mb-1.5 block text-[9px] tracking-[0.12em] text-peach">
                    {label}
                  </small>
                  <strong className="block font-serif text-[15px] leading-[normal] font-normal">
                    {value}
                  </strong>
                </span>
              ))}
            </div>
          ) : null}
          <div className="flex items-center gap-[13px] text-muted">
            <BrandIcon />
            <p className="max-w-[330px] text-[9px] leading-[1.5]">{privacy}</p>
          </div>
        </div>
        <div className="flex bg-paper p-[clamp(25px,4vw,50px)] shadow-[0_20px_60px_#1e2e2817] desk:min-h-[525px]">
          {children}
        </div>
      </main>
    </>
  );
}

export function ResultPanel({ kickerText, title, body, action }) {
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className={authFormClass}>
      <span className={kicker}>{kickerText}</span>
      <h2
        ref={headingRef}
        id="auth-result"
        tabIndex={-1}
        aria-describedby="auth-result-body"
        className={`${editorial} text-[clamp(40px,5vw,54px)]`}
      >
        {title}
      </h2>
      <p
        id="auth-result-body"
        className="max-w-[420px] text-[13px] leading-[1.75] text-muted"
      >
        {body}
      </p>
      <div className="mt-auto">{action}</div>
    </div>
  );
}

export function SubmitRow({ note, alternate, children }) {
  return (
    <div className="mt-auto flex flex-col gap-5">
      <small className="text-[12px] leading-[1.5] text-muted">
        {note}
      </small>
      {children}
      {alternate ? (
        <div className="text-[13px] leading-[1.75] text-muted">{alternate}</div>
      ) : null}
    </div>
  );
}

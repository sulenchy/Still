import { useEffect } from 'react';
import { BrandIcon } from './brand-icon.jsx';
import { SkipLink } from './skip-link.jsx';
import { editorial, kicker } from '../constants/class-names.js';
import { dashboardNav } from '../constants/dashboard.js';
import { Footer } from '../components/footer.jsx';

export const paperCard = 'bg-paper p-[clamp(25px,4vw,50px)] shadow-[0_20px_60px_#1e2e2817]';

const closedNav = 'hidden items-center gap-2 desk:flex desk:flex-wrap desk:justify-end';
const openNav = 'absolute top-[70px] right-[5vw] left-[5vw] z-50 flex flex-col items-stretch gap-2 bg-paper p-4 shadow-[0_15px_35px_#1e2e28] desk:static desk:inset-auto desk:z-auto desk:w-auto desk:flex-row desk:flex-wrap desk:justify-end desk:bg-transparent desk:p-0 desk:shadow-none';

function navClass(active) {
  return `inline-flex min-h-11 items-center rounded-full px-4 text-left text-sm ${
    active ? 'bg-forest text-white' : 'border border-line bg-paper text-ink'
  }`;
}

export function FormAlert({ id, title, messages }) {
  if (!messages.length) return null;

  return (
    <div
      id={id}
      tabIndex={-1}
      role="alert"
      className="border-l-2 border-error bg-error/8 px-4 py-3 outline-none"
    >
      <p className="font-serif text-[20px] leading-[1.3] text-error">{title}</p>
      <ul className="mt-2 text-[13px] leading-[1.6] font-medium text-error">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

export function FormStatus({ children }) {
  return (
    <p role="status" className="border-l-2 border-peach bg-cream px-4 py-3 text-[13px] leading-[1.6]">
      {children}
    </p>
  );
}

export function DashboardIntro({ kickerText, title, lede, children }) {
  return (
    <div className="max-w-[740px]">
      <span className={kicker}>{kickerText}</span>
      <h1
        id="dashboard-title"
        tabIndex={-1}
        className={`${editorial} mt-[17px] text-[clamp(40px,6vw,64px)] outline-none`}
      >
        {title}
      </h1>
      {lede ? (
        <p className="mt-6 max-w-[540px] text-[15px] leading-[1.75] text-muted">{lede}</p>
      ) : null}
      {children}
    </div>
  );
}

export function DashboardShell({
  view,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  onView,
  onSignOut,
  signingOut,
  signOutError,
  children,
}) {
  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCloseMenu();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, onCloseMenu]);

  return (
    <>
      <SkipLink />
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-[5vw] py-4">
        <BrandIcon />
        <button
          type="button"
          className="ml-auto block size-11 cursor-pointer border-0 bg-transparent p-0 desk:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="dashboard-navigation"
          onClick={onToggleMenu}
        >
          <i className="mx-auto my-[5px] block h-px w-[18px] bg-ink" />
          <i className="mx-auto my-[5px] block h-px w-[18px] bg-ink" />
        </button>
        <nav
          id="dashboard-navigation"
          className={menuOpen ? openNav : closedNav}
          aria-label="Archive"
        >
          {dashboardNav.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={navClass(view === id)}
              aria-current={view === id ? 'page' : undefined}
              onClick={() => onView(id)}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            className={`${navClass(false)} desk:hidden`}
            onClick={onSignOut}
            disabled={signingOut}
          >
            {signingOut ? 'Logging out…' : 'Log out'}
          </button>
        </nav>
        <button
          type="button"
          className="hidden min-h-11 items-center border-0 bg-transparent px-2 text-sm hover:underline disabled:cursor-wait disabled:opacity-60 desk:inline-flex"
          onClick={onSignOut}
          disabled={signingOut}
        >
          {signingOut ? 'Logging out…' : 'Log out'}
        </button>
        {signOutError ? (
          <p role="alert" className="basis-full text-sm text-error">{signOutError}</p>
        ) : null}
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="px-5 pt-6 pb-20 desk:px-[clamp(24px,7vw,108px)] desk:pt-10 desk:pb-24"
      >
        {children}
      </main>
      <Footer />
    </>
  );
}

import { Header, LogoutButton } from './header.jsx';
import { SkipLink } from './skip-link.jsx';
import { editorial, kicker } from '../constants/class-names.js';
import { dashboardNav } from '../constants/dashboard.js';
import { Footer } from '../components/footer.jsx';

export const paperCard = 'bg-paper p-[clamp(25px,4vw,50px)] shadow-[0_20px_60px_#1e2e2817]';

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

const desktopLogoutClass = 'inline-flex min-h-11 items-center border-0 bg-transparent px-2 text-sm hover:underline disabled:cursor-wait disabled:opacity-60';

export function DashboardShell({
  view,
  onView,
  onSignOut,
  signingOut,
  signOutError,
  children,
}) {
  return (
    <>
      <SkipLink />
      <Header
        variant="archive"
        id="dashboard-navigation"
        label="Archive"
        error={signOutError}
        renderNav={(closeMenu) => dashboardNav.map(([id, itemLabel]) => (
          <button
            key={id}
            type="button"
            className={navClass(view === id)}
            aria-current={view === id ? 'page' : undefined}
            onClick={() => {
              onView(id);
              closeMenu();
            }}
          >
            {itemLabel}
          </button>
        ))}
        renderActions={({ placement }) => (
          <LogoutButton
            signingOut={signingOut}
            onLogout={onSignOut}
            className={placement === 'menu' ? navClass(false) : desktopLogoutClass}
          />
        )}
      />
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

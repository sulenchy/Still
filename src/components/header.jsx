import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BrandIcon } from './brand-icon';
import {
  archiveClosedNav,
  archiveOpenNav,
  closedNav,
  openNav,
  primaryButton,
} from '../constants/class-names';
import { links } from '../constants/data';
import { useAuth } from '../auth/auth-provider';

const textActionClass = 'inline-flex min-h-11 items-center text-sm hover:underline';

const logoutActionClass = 'inline-flex min-h-11 items-center border-0 bg-transparent p-0 text-left text-sm hover:underline disabled:cursor-wait disabled:opacity-60';

const variants = {
  marketing: {
    header: 'relative z-20 flex h-17.5 items-center justify-between px-[5vw] desk:h-auto desk:min-h-20.5',
    menuButton: 'block size-9 cursor-pointer border-0 bg-transparent p-0 desk:hidden',
    closed: closedNav,
    open: openNav,
    menuActions: 'flex flex-col items-stretch gap-8 desk:hidden',
    desktopActions: 'hidden items-center gap-5 desk:flex',
    error: 'absolute top-full right-[5vw] z-30 max-w-xs pt-1 text-sm text-error',
  },
  archive: {
    header: 'relative z-20 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-[5vw] py-4',
    menuButton: 'ml-auto block size-11 cursor-pointer border-0 bg-transparent p-0 desk:hidden',
    closed: archiveClosedNav,
    open: archiveOpenNav,
    menuActions: 'flex flex-col items-stretch gap-2 desk:hidden',
    desktopActions: 'hidden items-center desk:flex',
    error: 'basis-full text-sm text-error',
  },
};

function MenuButton({ className, open, controls, onClick }) {
  return (
    <button
      type="button"
      className={className}
      aria-label="Toggle menu"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onClick}
    >
      <i className="mx-auto my-[5px] block h-px w-[18px] bg-ink" />
      <i className="mx-auto my-[5px] block h-px w-[18px] bg-ink" />
    </button>
  );
}

export function LogoutButton({ signingOut, onLogout, className = logoutActionClass }) {
  return (
    <button
      type="button"
      className={className}
      onClick={onLogout}
      disabled={signingOut}
    >
      {signingOut ? 'Logging out…' : 'Log out'}
    </button>
  );
}

function MarketingActions({ user, loading, signingOut, onLogout, onNavigate }) {
  if (loading) return null;

  if (user) {
    return (
      <>
        <Link to="/dashboard" className={textActionClass} onClick={onNavigate}>
          Your archive
        </Link>
        <LogoutButton signingOut={signingOut} onLogout={onLogout} />
      </>
    );
  }

  return (
    <>
      <Link to="/login" className={textActionClass} onClick={onNavigate}>
        Sign in
      </Link>
      <Link to="/signup" className={primaryButton} onClick={onNavigate}>
        Start your archive
      </Link>
    </>
  );
}

export function Header({
  variant = 'marketing',
  id = 'primary-navigation',
  label = 'Primary navigation',
  renderNav,
  renderActions,
  error,
}) {
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const styles = variants[variant];
  const closeMenu = () => setMenuOpen(false);
  const alertMessage = error ?? logoutError;

  const handleLogout = async () => {
    if (signingOut) return;

    setLogoutError('');
    setSigningOut(true);

    const { error: nextError } = await signOut();

    setSigningOut(false);

    if (nextError) {
      setLogoutError(nextError.message || 'Could not log out. Please try again.');
      return;
    }

    closeMenu();
  };

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const nav = renderNav ?? ((close) => links.map(([href, text]) => (
    <a key={href} href={href} className="text-sm hover:underline" onClick={close}>
      {text}
    </a>
  )));

  const actions = renderActions ?? (() => (
    <MarketingActions
      user={user}
      loading={loading}
      signingOut={signingOut}
      onLogout={handleLogout}
      onNavigate={closeMenu}
    />
  ));

  const actionNodes = {
    menu: actions({ placement: 'menu', closeMenu }),
    desktop: actions({ placement: 'desktop', closeMenu }),
  };
  const showActions = Boolean(renderActions) || !loading;

  return (
    <header className={styles.header}>
      <BrandIcon />
      <MenuButton
        className={styles.menuButton}
        open={menuOpen}
        controls={id}
        onClick={() => setMenuOpen((open) => !open)}
      />
      <nav
        id={id}
        className={menuOpen ? styles.open : styles.closed}
        aria-label={label}
      >
        {nav(closeMenu)}
        {showActions ? (
          <div className={styles.menuActions}>
            {actionNodes.menu}
          </div>
        ) : null}
      </nav>
      {showActions ? (
        <div className={styles.desktopActions}>
          {actionNodes.desktop}
        </div>
      ) : null}
      {alertMessage ? (
        <p role="alert" className={styles.error}>
          {alertMessage}
        </p>
      ) : null}
    </header>
  );
}

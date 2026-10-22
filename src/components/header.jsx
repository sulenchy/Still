import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BrandIcon } from './brand-icon';
import { primaryButton, closedNav, openNav } from '../constants/class-names';
import { links } from '../constants/data';
import { useAuth } from '../auth/auth-provider';

export const Header = () => {
  const { user, loading, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    if (signingOut) return;

    setLogoutError('');
    setSigningOut(true);

    const { error } = await signOut();

    setSigningOut(false);

    if (error) {
      setLogoutError(error.message || 'Could not log out. Please try again.');
      return;
    }

    closeMenu();
  };

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="relative z-20 flex h-17.5 items-center justify-between px-[5vw] desk:h-auto desk:min-h-20.5">
      <BrandIcon />
      <button
        type="button"
        className="block size-9 cursor-pointer border-0 bg-transparent p-0 desk:hidden"
        aria-label="Toggle menu"
        aria-expanded={isMenuOpen}
        aria-controls="primary-navigation"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <i className="mx-auto my-[5px] block h-px w-[18px] bg-ink" />
        <i className="mx-auto my-[5px] block h-px w-[18px] bg-ink" />
      </button>
      <nav
        id="primary-navigation"
        className={isMenuOpen ? openNav : closedNav}
        aria-label="Primary navigation"
      >
        {links.map(([href, label]) => (
          <a key={href} href={href} className="text-sm hover:underline" onClick={closeMenu}>
            {label}
          </a>
        ))}
        {!loading && user ? (
          <>
            <Link
              to="/dashboard"
              className="inline-flex min-h-11 items-center text-sm hover:underline desk:hidden"
              onClick={closeMenu}
            >
              Your archive
            </Link>
            <button
              type="button"
              className="inline-flex min-h-11 items-center border-0 bg-transparent p-0 text-left text-sm hover:underline disabled:cursor-wait disabled:opacity-60 desk:hidden"
              onClick={handleLogout}
              disabled={signingOut}
            >
              {signingOut ? 'Logging out…' : 'Log out'}
            </button>
          </>
        ) : null}
      </nav>
      <div className="hidden items-center gap-5 desk:flex">
        {!loading && user ? (
          <>
            <Link to="/dashboard" className="inline-flex min-h-11 items-center text-sm hover:underline">
              Your archive
            </Link>
            <button
              type="button"
              className="inline-flex min-h-11 items-center border-0 bg-transparent p-0 text-sm hover:underline disabled:cursor-wait disabled:opacity-60"
              onClick={handleLogout}
              disabled={signingOut}
            >
              {signingOut ? 'Logging out…' : 'Log out'}
            </button>
          </>
        ) : null}
        {!loading && !user ? (
          <>
            <Link to="/login" className="inline-flex min-h-11 items-center text-sm hover:underline">
              Sign in
            </Link>
            <Link to="/signup" className={primaryButton}>
              Start your archive
            </Link>
          </>
        ) : null}
      </div>
      {logoutError ? (
        <p role="alert" className="absolute top-full right-[5vw] z-30 max-w-xs pt-1 text-sm text-error">
          {logoutError}
        </p>
      ) : null}
    </header>
  );
};

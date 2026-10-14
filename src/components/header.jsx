import { useEffect, useState } from 'react';
import { BrandIcon } from './brand-icon';
import { primaryButton, closedNav, openNav } from '../constants/class-names';
import { links } from '../constants/data';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

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
      </nav>
      <div className="hidden items-center gap-5 desk:flex">
        <a href="#" className="text-sm">
          Sign in
        </a>
        <a href="#gallery" className={primaryButton}>
          Start your archive
        </a>
      </div>
    </header>
  );
};

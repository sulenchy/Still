import React from 'react';
import { BrandIcon } from './brand-icon';
import { primaryButton } from '../constants/class-names';

export const Header = () => {
  return (
    <header className="relative z-20 flex h-17.5 items-center justify-between px-[5vw] desk:h-auto desk:min-h-20.5">
      <BrandIcon />
      <input
        type="checkbox"
        id="menu-toggle"
        className="peer sr-only"
        aria-label="Toggle menu"
      />
      <label
        htmlFor="menu-toggle"
        className="block size-9 cursor-pointer desk:hidden"
        aria-label="Toggle menu"
      >
        <i className="mx-auto my-[5px] block h-px w-[18px] bg-ink" />
        <i className="mx-auto my-[5px] block h-px w-[18px] bg-ink" />
      </label>
      <nav
        className="hidden items-center gap-8 desk:flex max-desk:peer-checked:absolute max-desk:peer-checked:top-[65px] max-desk:peer-checked:right-[18px] max-desk:peer-checked:z-50 max-desk:peer-checked:flex max-desk:peer-checked:flex-col max-desk:peer-checked:items-stretch max-desk:peer-checked:bg-paper max-desk:peer-checked:p-4 max-desk:peer-checked:shadow-[0_15px_35px_#1e2e28]"
        aria-label="Primary navigation"
      >
        <a href="#gallery" className="text-sm hover:underline">
          Memories
        </a>
        <a href="#how-it-works" className="text-sm hover:underline">
          How it works
        </a>
        <a href="#family" className="text-sm hover:underline">
          For families
        </a>
        <a href="#contact" className="text-sm hover:underline">
          Contact
        </a>
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

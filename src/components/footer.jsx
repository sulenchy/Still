import { BrandIcon } from './brand-icon.jsx';

export const Footer = () => {
  return (
    <footer
      className="grid grid-cols-1 items-center justify-items-center gap-[35px] bg-deep px-[clamp(24px,7vw,108px)] py-7 text-center text-white/55 desk:grid-cols-[1fr_1fr_auto_auto] desk:justify-items-stretch desk:text-left"
      aria-labelledby="footer-title"
    >
      <div className="inline-flex items-center gap-2.5 text-white">
        <BrandIcon />
      </div>
      <p className="text-[8px]">For the stories that make us who we are.</p>
      <nav className="flex gap-[18px]">
        <button type="button" className="text-[12px]">Privacy</button>
        <button type="button" className="text-[12px]">Terms</button>
        <button type="button" className="text-[12px]">Contact</button>
      </nav>
      <span className="text-[8px]">© 2026 Still Archive</span>
    </footer>
  )
}
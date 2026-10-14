import { bar } from '../constants/class-names';

export const BrandIcon = ({ className = "" }) => {
  return (
    <a href="/" className="inline-flex items-center gap-2.5" aria-label="Still home">
      <span
        className={`inline-flex h-7 w-6.75 items-end justify-center gap-0.5 ${className}`}
        aria-hidden="true"
      >
        <i className={`${bar} h-4.25 rotate-[-23deg]`} />
        <i className={`${bar} h-6.25`} />
        <i className={`${bar} h-4.25 rotate-23`} />
      </span>
      <span className="font-serif text-[26px] leading-[normal] font-normal">Still</span>
    </a>

  );
}
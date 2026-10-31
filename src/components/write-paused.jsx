import { primaryButton } from '../constants/class-names.js';
import { paperCard } from './dashboard-shell.jsx';

export function WritePaused({ onAccount }) {
  return (
    <section className={`${paperCard} flex flex-col items-start gap-4`} aria-labelledby="write-paused-title">
      <h2 id="write-paused-title" className="font-serif text-[32px] leading-[1.1] font-normal">
        Adding is paused.
      </h2>
      <p className="text-[14px] leading-[1.7] text-muted">
        The archive stays readable. A subscription is what lets you keep a new moment, seal a capsule, or invite someone.
      </p>
      <button type="button" className={primaryButton} onClick={onAccount}>
        Open subscription
      </button>
    </section>
  );
}

import { useState } from 'react';
import { fieldClass } from '../constants/class-names';

export function UnderlineField({
  id,
  label,
  type = 'text',
  canReveal = false,
  revealName = '',
  error,
  hint,
  className = '',
  ...inputProps
}) {
  const [shown, setShown] = useState(false);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [
    hint && !error ? hintId : null,
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined;
  const revealTarget = revealName || label;
  const revealLabel = shown ? `Hide ${revealTarget}` : `Show ${revealTarget}`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[9px] tracking-[0.08em] uppercase">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={canReveal && shown ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`${fieldClass} placeholder:text-muted ${canReveal ? 'pr-16' : ''} ${className}`}
          {...inputProps}
        />
        {canReveal ? (
          <button
            type="button"
            className="absolute right-0 bottom-0 z-10 min-h-11 bg-paper px-1 text-[11px] tracking-[0.08em] text-ink uppercase"
            aria-controls={id}
            aria-pressed={shown}
            aria-label={revealLabel}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setShown((value) => !value)}
          >
            {shown ? 'Hide' : 'Show'}
          </button>
        ) : null}
      </div>
      {hint && !error ? (
        <small id={hintId} className="mt-2 block text-[12px] leading-[1.5] text-muted">
          {hint}
        </small>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-2 text-[13px] leading-[1.5] text-forest">
          {error}
        </p>
      ) : null}
    </div>
  );
}

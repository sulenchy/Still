import { DashboardIntro, paperCard } from './dashboard-shell.jsx';
import { primaryButton } from '../constants/class-names.js';

export function DashboardAccount({ email, onSignOut, signingOut }) {
  return (
    <div className="grid items-start gap-12 desk:grid-cols-[0.9fr_1.1fr]">
      <DashboardIntro
        kickerText="ACCOUNT"
        title={(
          <>
            Your archive, <em className="font-normal text-peach">your say.</em>
          </>
        )}
        lede="Still is private by default. You decide who can see a memory, and a time capsule stays sealed until the day you choose."
      >
        <dl className="mt-8 grid gap-5 border-y border-line py-6">
          <div>
            <dt className="text-[9px] tracking-[0.12em] text-peach uppercase">Signed in as</dt>
            <dd className="mt-2 font-serif text-[22px] leading-[1.3] font-normal break-all">
              {email || 'Your archive'}
            </dd>
          </div>
          <div>
            <dt className="text-[9px] tracking-[0.12em] text-peach uppercase">Saved</dt>
            <dd className="mt-2 text-[14px] leading-[1.7] text-muted">
              Moments, invitations, and capsules are kept with your archive. They are still here the next time you sign in.
            </dd>
          </div>
        </dl>
      </DashboardIntro>

      <section className={`${paperCard} flex flex-col gap-6`} aria-labelledby="sign-out-title">
        <h2 id="sign-out-title" className="font-serif text-[40px] leading-[1.05] font-normal">
          Leave quietly.
        </h2>
        <p className="max-w-[420px] text-[14px] leading-[1.7] text-muted">
          Logging out clears this session on this device. The archive stays private, ready when you come back.
        </p>
        <button
          type="button"
          className={`${primaryButton} self-start disabled:cursor-wait disabled:opacity-60`}
          onClick={onSignOut}
          disabled={signingOut}
        >
          {signingOut ? 'Logging out…' : 'Log out'}
        </button>
      </section>
    </div>
  );
}

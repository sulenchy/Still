import { useState } from 'react';
import { ArrowIcon } from './arrow-icon.jsx';
import { DashboardIntro, FormAlert, FormStatus, paperCard } from './dashboard-shell.jsx';
import { WritePaused } from './write-paused.jsx';
import { editorial, fieldClass, kicker, primaryButton } from '../constants/class-names.js';
import { formatLongDate } from '../constants/dashboard.js';
import { UnderlineField } from './underline-field.jsx';
import { firstErrorId, useQueuedFocus } from '../lib/index.js';

const fields = [
  ['title', 'capsule-title'],
  ['recipient', 'capsule-recipient'],
  ['opens', 'capsule-opens'],
  ['message', 'capsule-message'],
];

function choiceClass(selected) {
  return `flex min-h-11 cursor-pointer items-center gap-3 border px-4 text-left ${
    selected ? 'border-forest bg-pale' : 'border-line bg-paper'
  }`;
}

function isoDaysFromNow(days) {
  const now = new Date();
  now.setDate(now.getDate() + days);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function DashboardCapsules({
  capsules,
  people,
  memories,
  signature,
  onCreate,
  canWrite = true,
  onAccount,
}) {
  const [values, setValues] = useState({
    title: '',
    recipient: '',
    opens: '',
    message: '',
  });
  const [memoryIds, setMemoryIds] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const queueFocus = useQueuedFocus();
  const messages = [...new Set([formError, ...Object.values(errors)].filter(Boolean))];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setStatus('');
    setFormError('');
    setErrors((current) => (current[name] ? { ...current, [name]: '' } : current));
  };

  const toggleMemory = (id) => {
    setMemoryIds((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || canWrite !== true) return;
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = 'Title is required';
    if (!values.recipient) nextErrors.recipient = 'Choose who this is for';
    if (!values.opens) nextErrors.opens = 'Choose the day it opens';
    else if (values.opens < isoDaysFromNow(1)) nextErrors.opens = 'Choose a day in the future';
    if (!values.message.trim()) nextErrors.message = 'A note for that day is required';
    setErrors(nextErrors);
    setFormError('');
    setStatus('');

    const invalidId = firstErrorId(nextErrors, fields);
    if (invalidId) {
      queueFocus(invalidId);
      return;
    }

    const recipient = people.find((person) => person.id === values.recipient);
    const chosenIds = [...memoryIds];
    setSaving(true);
    try {
      await onCreate({
        title: values.title.trim(),
        recipientId: values.recipient,
        opensOn: values.opens,
        message: values.message.trim(),
        signature: signature || 'Kept for later',
        memoryIds: chosenIds,
      });
      setValues({ title: '', recipient: '', opens: '', message: '' });
      setMemoryIds([]);
      setStatus(chosenIds.length
        ? `Sealed for ${recipient?.name || 'your family'}.`
        : `Started for ${recipient?.name || 'your family'}. Add memories whenever you’re ready.`);
    } catch (error) {
      setFormError(error?.message || 'Could not seal that capsule.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-12">
      <DashboardIntro
        kickerText="A GIFT FOR LATER"
        title={(
          <>
            Keep it for <em className="font-normal text-peach">who they’re becoming.</em>
          </>
        )}
        lede="Seal a few memories for someone too young to hold them yet. On the day you choose, the note will be waiting."
      />

      <div className="grid items-start gap-8 desk:grid-cols-[0.9fr_1.1fr]">
        <section aria-labelledby="capsule-list-title" className="flex flex-col gap-4">
          <h2 id="capsule-list-title" className="sr-only">Your capsules</h2>
          {capsules.length === 0 ? (
            <div className="border border-dashed border-sage bg-cream px-6 py-14">
              <p className={`${editorial} text-[36px]`}>No capsules yet.</p>
              <p className="mt-3 text-[13px] leading-[1.7] text-muted">
                Write the note now. Choose the day later.
              </p>
            </div>
          ) : capsules.map((capsule) => (
            <article key={capsule.id} className="bg-beige p-6" aria-labelledby={`capsule-${capsule.id}`}>
              <span className={kicker}>{capsule.status}</span>
              <h3 id={`capsule-${capsule.id}`} className={`${editorial} mt-3 text-[clamp(32px,4vw,44px)]`}>
                {capsule.title}
              </h3>
              <p className="mt-3 text-[12px] tracking-[0.08em] uppercase">
                For {capsule.recipient} · Opens {formatLongDate(capsule.opens)}
              </p>
              <blockquote className="mt-5 border-l border-peach pl-4 font-serif text-[22px] leading-[1.4] italic">
                {capsule.message}
                <footer className="mt-3 block font-sans text-[11px] tracking-[0.08em] text-ink/60 uppercase not-italic">
                  — {capsule.signature}
                </footer>
              </blockquote>
              <p className="mt-5 text-[13px] text-muted">
                {capsule.memoryIds.length === 1
                  ? '1 memory inside'
                  : `${capsule.memoryIds.length} memories inside`}
              </p>
            </article>
          ))}
        </section>

        {canWrite === false ? (
          <WritePaused onAccount={onAccount} />
        ) : (
        <form className={`${paperCard} flex flex-col gap-6`} onSubmit={handleSubmit} noValidate>
          <div>
            <span className={kicker}>NEW CAPSULE</span>
            <h2 className={`${editorial} mt-3 text-[40px]`}>Write it now. Open it later.</h2>
          </div>
          {status ? <FormStatus>{status}</FormStatus> : null}
          <FormAlert id="capsule-error" title="We couldn’t seal that yet." messages={messages} />
          <UnderlineField
            id="capsule-title"
            name="title"
            label="Title"
            value={values.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="For when you wonder"
            required
          />
          <div>
            <label htmlFor="capsule-recipient" className="mb-2 block text-[9px] tracking-[0.08em] uppercase">
              Who is it for?
            </label>
            <select
              id="capsule-recipient"
              name="recipient"
              value={values.recipient}
              required
              aria-invalid={errors.recipient ? 'true' : undefined}
              aria-describedby={errors.recipient ? 'capsule-recipient-error' : undefined}
              className={fieldClass}
              onChange={handleChange}
            >
              <option value="">Choose a person</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>{person.name}</option>
              ))}
            </select>
            {errors.recipient ? (
              <p id="capsule-recipient-error" className="mt-2 text-[13px] leading-[1.5] font-medium text-error">
                {errors.recipient}
              </p>
            ) : null}
          </div>
          <UnderlineField
            id="capsule-opens"
            name="opens"
            label="Open this on"
            type="date"
            value={values.opens}
            onChange={handleChange}
            error={errors.opens}
            min={isoDaysFromNow(1)}
            required
          />
          <div>
            <label htmlFor="capsule-message" className="mb-2 block text-[9px] tracking-[0.08em] uppercase">
              A note for that day
            </label>
            <textarea
              id="capsule-message"
              name="message"
              rows="4"
              required
              value={values.message}
              placeholder="For when you wonder how deeply you were loved."
              aria-invalid={errors.message ? 'true' : undefined}
              aria-describedby={errors.message ? 'capsule-message-error' : undefined}
              className={`${fieldClass} placeholder:text-muted`}
              onChange={handleChange}
            />
            {errors.message ? (
              <p id="capsule-message-error" className="mt-2 text-[13px] leading-[1.5] font-medium text-error">
                {errors.message}
              </p>
            ) : null}
          </div>
          <fieldset>
            <legend className="mb-1 text-[9px] tracking-[0.08em] uppercase">Memories to include</legend>
            <p className="mb-3 text-[12px] leading-[1.5] text-muted">
              Leave this empty to start a capsule you’ll fill later.
            </p>
            <div className="grid max-h-64 gap-2 overflow-auto pr-1">
              {memories.map((memory) => (
                <label key={memory.id} className={choiceClass(memoryIds.includes(memory.id))}>
                  <input
                    type="checkbox"
                    name="capsule-memories"
                    value={memory.id}
                    checked={memoryIds.includes(memory.id)}
                    onChange={() => toggleMemory(memory.id)}
                  />
                  <span>
                    <span className="block">{memory.title}</span>
                    <span className="block text-[12px] text-muted">{memory.date}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" className={`${primaryButton} self-start`} disabled={saving || canWrite !== true}>
            {saving
              ? 'Saving this capsule'
              : (canWrite === null
                ? 'Checking your subscription'
                : (memoryIds.length ? 'Seal this capsule' : 'Start this capsule'))}
            <ArrowIcon />
          </button>
        </form>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ArrowIcon } from './arrow-icon.jsx';
import { DashboardIntro, FormAlert, FormStatus, paperCard } from './dashboard-shell.jsx';
import { editorial, fieldClass, primaryButton } from '../constants/class-names.js';
import { initialFromName, inviteRoles } from '../constants/dashboard.js';
import { roles } from '../constants/data.js';
import { UnderlineField } from './underline-field.jsx';
import { firstErrorId, isEmailAddress, useQueuedFocus } from '../lib/index.js';

const fields = [
  ['name', 'invite-name'],
  ['email', 'invite-email'],
  ['role', 'invite-role'],
];

function roleMeta(roleName) {
  return roles.find((role) => role[2] === roleName) || ['?', '', roleName, '', 'bg-pale'];
}

export function DashboardFamily({ ownerName, ownerEmail, people, onInvite }) {
  const [values, setValues] = useState({ name: '', email: '', role: 'Family member' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const queueFocus = useQueuedFocus();
  const messages = [...new Set([formError, ...Object.values(errors)].filter(Boolean))];
  const owner = roleMeta('Owner');
  const members = [
    {
      id: 'owner',
      name: ownerName || 'You',
      email: ownerEmail,
      role: 'Owner',
    },
    ...people,
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setStatus('');
    setFormError('');
    setErrors((current) => (current[name] ? { ...current, [name]: '' } : current));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const nextErrors = {};
    const name = values.name.trim();
    const email = values.email.trim();
    const known = new Set(
      [ownerEmail, ...people.map((person) => person.email)]
        .filter(Boolean)
        .map((item) => item.toLowerCase()),
    );

    if (!name) nextErrors.name = 'Name is required';
    if (!email) nextErrors.email = 'Email is required';
    else if (!isEmailAddress(email)) nextErrors.email = 'Enter an email address like anna@example.com';
    else if (known.has(email.toLowerCase())) nextErrors.email = 'That person is already in this archive.';
    if (!inviteRoles.includes(values.role)) nextErrors.role = 'Choose a role';
    setErrors(nextErrors);
    setFormError('');
    setStatus('');

    const invalidId = firstErrorId(nextErrors, fields);
    if (invalidId) {
      queueFocus(invalidId);
      return;
    }

    setSaving(true);
    try {
      await onInvite({ name, email, role: values.role });
      setValues({ name: '', email: '', role: values.role });
      setStatus(`${name} is invited as a ${values.role.toLowerCase()}.`);
    } catch (error) {
      setFormError(error?.message || 'Could not invite that person.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-12">
      <DashboardIntro
        kickerText="YOUR PEOPLE, YOUR WAY"
        title={(
          <>
            It takes a family <em className="font-normal text-peach">to tell a life.</em>
          </>
        )}
        lede="Invite the people who hold a piece of the story. Everyone has a place, and you’re always in control."
      />

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 desk:grid-cols-4">
        {members.map((person) => {
          const [, , roleName, detail, badge] = roleMeta(person.role);
          return (
            <li key={person.id} className="border border-line bg-paper p-6">
              <span className={`grid size-12 place-items-center rounded-full font-serif text-[20px] ${badge}`}>
                <span className="sr-only">{person.name}</span>
                <span aria-hidden="true">{initialFromName(person.name)}</span>
              </span>
              <h2 className="mt-8 font-serif text-[26px] leading-none font-normal">{person.name}</h2>
              <p className="mt-2 text-[13px]">{roleName}</p>
              {person.email ? (
                <p className="mt-2 text-[12px] break-all text-muted">{person.email}</p>
              ) : null}
              <p className="mt-4 text-[13px] leading-[1.6] text-muted">{detail}</p>
            </li>
          );
        })}
      </ul>

      <div className="grid items-start gap-8 desk:grid-cols-[0.8fr_1.2fr]">
        <section aria-labelledby="roles-title">
          <h2 id="roles-title" className={`${editorial} text-[clamp(32px,4vw,44px)]`}>
            A place for everyone
          </h2>
          <ul className="mt-6 flex flex-col">
            {roles.map(([initial, , roleName, detail, badge]) => (
              <li key={roleName} className="flex gap-4 border-t border-line py-4">
                <span className={`grid size-11 shrink-0 place-items-center rounded-full font-serif ${badge}`}>
                  <span className="sr-only">{roleName}</span>
                  <span aria-hidden="true">{initial}</span>
                </span>
                <span>
                  <strong className="block font-serif text-[20px] font-normal">{roleName}</strong>
                  <small className="mt-1 block text-[13px] leading-[1.5] text-muted">{detail}</small>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <form className={`${paperCard} flex flex-col gap-6`} onSubmit={handleSubmit} noValidate aria-labelledby="invite-title">
          <div>
            <h2 id="invite-title" className={`${editorial} text-[40px]`}>Invite someone in.</h2>
            <p className="mt-3 text-[13px] leading-[1.7] text-muted">
              You’ll stay the owner. They only receive the place you give them.
            </p>
          </div>
          {status ? <FormStatus>{status}</FormStatus> : null}
          <FormAlert id="invite-error" title="We couldn’t add that invitation." messages={messages} />
          <UnderlineField
            id="invite-name"
            name="name"
            label="Name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Anna Miller"
            autoComplete="name"
            required
          />
          <UnderlineField
            id="invite-email"
            name="email"
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="anna@example.com"
            required
          />
          <div>
            <label htmlFor="invite-role" className="mb-2 block text-[9px] tracking-[0.08em] uppercase">
              Their place
            </label>
            <select
              id="invite-role"
              name="role"
              value={values.role}
              aria-invalid={errors.role ? 'true' : undefined}
              aria-describedby={errors.role ? 'invite-role-error' : undefined}
              className={fieldClass}
              onChange={handleChange}
            >
              {inviteRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            {errors.role ? (
              <p id="invite-role-error" className="mt-2 text-[13px] leading-[1.5] font-medium text-error">
                {errors.role}
              </p>
            ) : null}
          </div>
          <button type="submit" className={`${primaryButton} self-start`} disabled={saving}>
            {saving ? 'Inviting' : 'Invite to the archive'}
            <ArrowIcon />
          </button>
        </form>
      </div>
    </div>
  );
}

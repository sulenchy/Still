import { useState } from 'react';
import { Link } from 'react-router';
import { textLink } from '../constants/class-names';
import { ArrowIcon } from '../components/arrow-icon.jsx';
import { UnderlineField } from '../components/underline-field.jsx';
import {
  AuthShell,
  ResultPanel,
  SubmitRow,
  authFormClass,
  authSubmitClass,
  firstErrorId,
  isEmailAddress,
  usePreviewSubmit,
  useQueuedFocus,
} from '../components/auth-shell.jsx';

const formCopy = {
  documentTitle: 'Create account | Still',
  kickerText: 'YOUR STORY STARTS HERE',
  title: 'Create your account.',
  emphasis: 'Begin with one quiet place.',
  lede: 'Start preserving the memories your family shares. Private by default. Invite people when you’re ready.',
  privacy: 'Your stories stay yours. We’ll only use these details to open your archive.',
  facts: [
    ['START', 'One photo is enough'],
    ['ACCESS', 'You decide who can see it'],
  ],
};

const doneCopy = {
  documentTitle: 'Your archive | Still',
  kickerText: 'IT’S YOURS',
  title: 'Your archive is ready.',
  emphasis: 'Private, until you say otherwise.',
  lede: 'Start with one photo. Add the story only you can tell.',
  privacy: 'Your stories stay yours. We’ll only use these details to open your archive.',
  facts: [
    ['START', 'One photo is enough'],
    ['ACCESS', 'You decide who can see it'],
  ],
};

const fields = [
  ['email', 'email'],
  ['password', 'password'],
  ['confirmPassword', 'confirm-password'],
];

function validateSignup(values) {
  const errors = {};
  if (!values.email.trim()) errors.email = 'Email is required';
  else if (!isEmailAddress(values.email)) errors.email = 'Enter an email address like anna@example.com';

  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 8) errors.password = 'Use at least 8 characters';

  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password';
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Those passwords don’t match';

  return errors;
}

function Signup() {
  const [done, setDone] = useState(false);
  const [values, setValues] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const { status, liveMessage, start } = usePreviewSubmit();
  const queueFocus = useQueuedFocus();
  const copy = done ? doneCopy : formCopy;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (name === 'password' || name === 'confirmPassword') {
        if (!current.password && !current.confirmPassword) return current;
        return { ...current, password: '', confirmPassword: '' };
      }
      return current[name] ? { ...current, [name]: '' } : current;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (status === 'submitting') return;

    const nextErrors = validateSignup(values);
    setErrors(nextErrors);
    const invalidId = firstErrorId(nextErrors, fields);
    if (invalidId) {
      queueFocus(invalidId);
      return;
    }

    start('Creating account.', () => setDone(true));
  };

  return (
    <AuthShell {...copy}>
      {done ? (
        <ResultPanel
          kickerText="WELCOME"
          title="We’ll keep it safe."
          body="Add a memory whenever you like. Invite your family when you want them beside you."
          action={(
            <Link to="/" className={authSubmitClass}>
              Go to your archive
              <ArrowIcon />
            </Link>
          )}
        />
      ) : (
        <form
          className={authFormClass}
          method="post"
          onSubmit={handleSubmit}
          noValidate
          aria-busy={status === 'submitting'}
        >
          <p className="sr-only" aria-live="polite">{liveMessage}</p>
          <UnderlineField
            id="email"
            name="email"
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="anna@example.com"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            required
            enterKeyHint="next"
          />
          <UnderlineField
            id="password"
            name="password"
            label="Create a password"
            type="password"
            canReveal
            revealName="password"
            autoComplete="new-password"
            hint="At least 8 characters."
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            required
            minLength={8}
            enterKeyHint="next"
          />
          <UnderlineField
            id="confirm-password"
            name="confirmPassword"
            label="Confirm password"
            type="password"
            canReveal
            revealName="password confirmation"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
            minLength={8}
            enterKeyHint="go"
          />
          <SubmitRow
            note="By creating an account, you agree to our privacy policy."
            alternate={(
              <p className="flex flex-wrap items-center gap-x-2">
                <span>Already have an account?</span>
                <Link
                  to="/login"
                  className={textLink}
                  aria-disabled={status === 'submitting'}
                  tabIndex={status === 'submitting' ? -1 : undefined}
                  onClick={(event) => {
                    if (status === 'submitting') event.preventDefault();
                  }}
                >
                  Sign in
                </Link>
              </p>
            )}
          >
            <button type="submit" className={authSubmitClass} disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Creating account' : 'Create account'}
              <ArrowIcon />
            </button>
          </SubmitRow>
        </form>
      )}
    </AuthShell>
  );
}

export default Signup;

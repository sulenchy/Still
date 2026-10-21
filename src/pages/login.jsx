import { useState } from 'react';
import { Link } from 'react-router';
import { textLink, authFormClass, authSubmitClass  } from '../constants/class-names';
import { ArrowIcon } from '../components/arrow-icon.jsx';
import { UnderlineField} from '../components/underline-field.jsx';
import {
    AuthShell,
    ResultPanel,
    SubmitRow
} from '../components';

import {
  firstErrorId,
  isEmailAddress,
  usePreviewSubmit,
  useQueuedFocus,
} from '../lib/index.js'

const views = {
  'sign-in': {
    documentTitle: 'Sign in | Still',
    kickerText: 'SIGN IN',
    title: 'Welcome back.',
    emphasis: 'The little things are still here.',
    lede: 'Sign in to revisit the photos, voices, and notes your family has gathered.',
    privacy: 'Your stories stay yours. We’ll only use these details to sign you in.',
    facts: [
      ['PRIVACY', 'Private by default'],
      ['FAMILY', 'Invite when you’re ready'],
    ],
  },
  reset: {
    documentTitle: 'Reset password | Still',
    kickerText: 'RESET PASSWORD',
    title: 'Forgot your password?',
    emphasis: 'We’ll help you back in.',
    lede: 'Enter the email on your archive and we’ll prepare a reset note.',
    privacy: 'Your stories stay yours. We’ll only use this email to help you sign in.',
    facts: [
      ['EMAIL', 'The address on your account'],
      ['NEXT', 'A note to choose a new password'],
    ],
  },
  'signed-in': {
    documentTitle: 'Welcome back | Still',
    kickerText: 'WELCOME BACK',
    title: 'Good to see you.',
    emphasis: 'Your stories kept.',
    lede: 'Take a quiet moment with the people you love.',
    privacy: 'Your stories stay yours. We’ll only use these details to sign you in.',
    facts: [
      ['PRIVACY', 'Private by default'],
      ['FAMILY', 'Invite when you’re ready'],
    ],
  },
  'reset-sent': {
    documentTitle: 'Check your email | Still',
    kickerText: 'CHECK YOUR EMAIL',
    title: 'Look for a note.',
    emphasis: 'It may take a minute.',
    lede: 'Your archive stays private either way.',
    privacy: 'Your stories stay yours. We’ll only use this email to help you sign in.',
    facts: [
      ['EMAIL', 'The address on your account'],
      ['NEXT', 'A note to choose a new password'],
    ],
  },
};

const signInFields = [
  ['email', 'email'],
  ['password', 'password'],
];

const resetFields = [['email', 'email']];

function validateEmail(email) {
  if (!email.trim()) return 'Email is required';
  if (!isEmailAddress(email)) return 'Enter an email address like anna@example.com';
  return '';
}

function validateSignIn(values) {
  const errors = {};
  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;
  if (!values.password) errors.password = 'Password is required';
  return errors;
}

function validateReset(values) {
  const errors = {};
  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;
  return errors;
}

function Login() {
  const [intent, setIntent] = useState('sign-in');
  const [panel, setPanel] = useState('');
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { status, liveMessage, start } = usePreviewSubmit();
  const queueFocus = useQueuedFocus();
  const view = panel || intent;
  const copy = views[view];

  const showSignIn = () => {
    setPanel('');
    setIntent('sign-in');
    setErrors({});
    queueFocus('email');
  };

  const showReset = () => {
    setIntent('reset');
    setErrors({});
    queueFocus('email');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: '' } : current));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (status === 'submitting') return;

    const nextErrors = intent === 'reset' ? validateReset(values) : validateSignIn(values);
    setErrors(nextErrors);
    const invalidId = firstErrorId(nextErrors, intent === 'reset' ? resetFields : signInFields);
    if (invalidId) {
      queueFocus(invalidId);
      return;
    }

    const message = intent === 'reset' ? 'Sending reset note.' : 'Signing in.';
    start(message, () => {
      setPanel(intent === 'reset' ? 'reset-sent' : 'signed-in');
    });
  };

  const submitLabel = status === 'submitting'
    ? (intent === 'reset' ? 'Sending note' : 'Signing in')
    : (intent === 'reset' ? 'Send reset note' : 'Sign in');

  return (
    <AuthShell {...copy}>
      {panel === 'signed-in' ? (
        <ResultPanel
          kickerText="YOUR ARCHIVE"
          title="The archive is open."
          body="Whenever you’re ready, it’s just where you left it."
          action={(
            <Link to="/" className={authSubmitClass}>
              Open the archive
              <ArrowIcon />
            </Link>
          )}
        />
      ) : null}
      {panel === 'reset-sent' ? (
        <ResultPanel
          kickerText="RESET PASSWORD"
          title="Note sent."
          body="If that address belongs to an account, a reset note is on its way. If it doesn’t, we won’t send anything."
          action={(
            <button type="button" className={authSubmitClass} onClick={showSignIn}>
              Back to sign in
              <ArrowIcon />
            </button>
          )}
        />
      ) : null}
      {panel ? null : (
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
            enterKeyHint={intent === 'reset' ? 'go' : 'next'}
          />
          {intent === 'sign-in' ? (
            <UnderlineField
              id="password"
              name="password"
              label="Password"
              type="password"
              canReveal
              revealName="password"
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              required
              enterKeyHint="go"
            />
          ) : null}
          {intent === 'sign-in' ? (
            <button
              type="button"
              className={`${textLink} self-start`}
              onClick={showReset}
              disabled={status === 'submitting'}
            >
              Forgot password?
            </button>
          ) : null}
          <SubmitRow
            note={intent === 'reset'
              ? 'We’ll only use this email to find your archive.'
              : 'By signing in, you agree to our privacy policy.'}
            alternate={intent === 'reset' ? (
              <button
                type="button"
                className={textLink}
                onClick={showSignIn}
                disabled={status === 'submitting'}
              >
                Back to sign in
              </button>
            ) : (
              <p className="flex flex-wrap items-center gap-x-2">
                <span>New to Still?</span>
                <Link
                  to="/signup"
                  className={textLink}
                  aria-disabled={status === 'submitting'}
                  tabIndex={status === 'submitting' ? -1 : undefined}
                  onClick={(event) => {
                    if (status === 'submitting') event.preventDefault();
                  }}
                >
                  Create an account
                </Link>
              </p>
            )}
          >
            <button type="submit" className={authSubmitClass} disabled={status === 'submitting'}>
              {submitLabel}
              <ArrowIcon />
            </button>
          </SubmitRow>
        </form>
      )}
    </AuthShell>
  );
}

export default Login;

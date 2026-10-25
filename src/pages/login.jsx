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
  messagesFrom,
  readSignInError,
  supabase,
  useQueuedFocus,
  validateReset,
  validateSignIn,
} from '../lib/index.js'

import { signInFields, resetFields, signInViews } from '../constants/data.js';

function Login() {
  const [intent, setIntent] = useState('sign-in');
  const [panel, setPanel] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const queueFocus = useQueuedFocus();
  const view = panel || intent;
  const copy = signInViews[view];
  const messages = messagesFrom(errors, formError);
  const errorTitle = intent === 'reset'
    ? 'We couldn’t send a reset note.'
    : 'We couldn’t sign you in.';

  const showSignIn = () => {
    setPanel('');
    setIntent('sign-in');
    setErrors({});
    setFormError('');
    queueFocus('email');
  };

  const showReset = () => {
    setIntent('reset');
    setErrors({});
    setFormError('');
    queueFocus('email');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFormError('');
    setErrors((current) => (current[name] ? { ...current, [name]: '' } : current));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const fields = intent === 'reset' ? resetFields : signInFields;
    const nextErrors = intent === 'reset' ? validateReset(values) : validateSignIn(values);
    setErrors(nextErrors);
    const invalidId = firstErrorId(nextErrors, fields);
    if (invalidId) {
      setFormError('');
      queueFocus(invalidId);
      return;
    }

    if (intent === 'reset') {
      setFormError('');
      setPanel('reset-sent');
      return;
    }

    setFormError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });

      if (error) {
        const result = readSignInError(error);
        setErrors(result.fieldErrors);
        setFormError(result.formError);
        queueFocus(firstErrorId(result.fieldErrors, signInFields) || 'login-error');
        return;
      }

      if (!data?.session) {
        setFormError('Something went wrong. Please try again.');
        queueFocus('login-error');
        return;
      }

      setPanel('signed-in');
    } catch {
      setFormError('Something went wrong. Please check your connection and try again.');
      queueFocus('login-error');
    } finally {
      setLoading(false);
    }
  };

  const submitLabel = loading
    ? 'Signing in'
    : (intent === 'reset' ? 'Send reset note' : 'Sign in');

  return (
    <AuthShell {...copy}>
      {panel === 'signed-in' ? (
        <ResultPanel
          kickerText="YOUR ARCHIVE"
          title="The archive is open."
          body="Whenever you’re ready, it’s just where you left it."
          action={(
            <Link to="/dashboard" className={authSubmitClass}>
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
          aria-busy={loading}
        >
          <p className="sr-only" aria-live="polite">{loading ? 'Signing in.' : ''}</p>
          {messages.length > 0 ? (
            <div
              id="login-error"
              tabIndex={-1}
              role="alert"
              className="border-l-2 border-error bg-error/8 px-4 py-3 outline-none"
            >
              <p className="font-serif text-[20px] leading-[1.3] text-error">{errorTitle}</p>
              <ul className="mt-2 text-[13px] leading-[1.6] font-medium text-error">
                {messages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}
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
              disabled={loading}
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
                disabled={loading}
              >
                Back to sign in
              </button>
            ) : (
              <p className="flex flex-wrap items-center gap-x-2">
                <span>New to Still?</span>
                <Link
                  to="/signup"
                  className={textLink}
                  aria-disabled={loading}
                  tabIndex={loading ? -1 : undefined}
                  onClick={(event) => {
                    if (loading) event.preventDefault();
                  }}
                >
                  Create an account
                </Link>
              </p>
            )}
          >
            <button type="submit" className={authSubmitClass} disabled={loading}>
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

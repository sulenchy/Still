import { useState } from 'react';
import { Link } from 'react-router';
import { textLink,  authFormClass, authSubmitClass, } from '../constants/class-names';
import { ArrowIcon } from '../components/arrow-icon.jsx';
import { UnderlineField } from '../components/underline-field.jsx';

import {
  AuthShell,
  ResultPanel,
  SubmitRow
} from '../components';

import {
  firstErrorId,
  isEmailAddress,
  useQueuedFocus,
  supabase
} from '../lib';

import {
  formCopy,
  doneCopy,
  signupFields
} from '../constants/data.js'

import {
  validateSignup,
  readSignUpError,
  messagesFrom
} from '../lib';

function Signup() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [values, setValues] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const queueFocus = useQueuedFocus();
  const copy = done ? doneCopy : formCopy;
  const messages = messagesFrom(errors, formError);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFormError('');
    setErrors((current) => {
      if (name === 'password' || name === 'confirmPassword') {
        if (!current.password && !current.confirmPassword) return current;
        return { ...current, password: '', confirmPassword: '' };
      }
      return current[name] ? { ...current, [name]: '' } : current;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const nextErrors = validateSignup(values);
    setErrors(nextErrors);
    const invalidId = firstErrorId(nextErrors, signupFields);
    if (invalidId) {
      setFormError('');
      queueFocus(invalidId);
      return;
    }

    setFormError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
      });

      if (error) {
        const result = readSignUpError(error);
        setErrors(result.fieldErrors);
        setFormError(result.formError);
        queueFocus(firstErrorId(result.fieldErrors, signupFields) || 'signup-error');
        return;
      }

      if (!data?.user) {
        setFormError('Something went wrong. Please try again.');
        queueFocus('signup-error');
        return;
      }

      setHasSession(Boolean(data.session));
      setResultMessage(
        data.session
          ? 'Your account has been created successfully.'
          : 'Account request received. Check your email for a confirmation link if required.',
      );
      setDone(true);
    } catch {
      setFormError('Something went wrong. Please check your connection and try again.');
      queueFocus('signup-error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell {...copy}>
      {done ? (
        <ResultPanel
          kickerText="WELCOME"
          title="We’ll keep it safe."
          body={resultMessage || 'Add a memory whenever you like. Invite your family when you want them beside you.'}
          action={(
            <Link to={hasSession ? '/dashboard' : '/'} className={authSubmitClass}>
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
          aria-busy={loading}
        >
          <p className="sr-only" aria-live="polite">{loading ? 'Creating account.' : ''}</p>
          {messages.length > 0 ? (
            <div
              id="signup-error"
              tabIndex={-1}
              role="alert"
              className="border-l-2 border-error bg-error/8 px-4 py-3 outline-none"
            >
              <p className="font-serif text-[20px] leading-[1.3] text-error">We couldn’t create your account.</p>
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
                  aria-disabled={loading}
                  tabIndex={loading ? -1 : undefined}
                  onClick={(event) => {
                    if (loading) event.preventDefault();
                  }}
                >
                  Sign in
                </Link>
              </p>
            )}
          >
            <button type="submit" className={authSubmitClass} disabled={loading}>
              {loading ? 'Creating account' : 'Create account'}
              <ArrowIcon />
            </button>
          </SubmitRow>
        </form>
      )}
    </AuthShell>
  );
}

export default Signup;

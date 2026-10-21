import { useEffect, useRef, useState } from 'react';
import supabase from './supabase';

export function isEmailAddress(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function firstErrorId(errors, fields) {
  const match = fields.find(([key]) => errors[key]);
  return match ? match[1] : '';
}

export function useQueuedFocus() {
  const pendingId = useRef('');

  useEffect(() => {
    if (!pendingId.current) return undefined;
    const id = pendingId.current;
    pendingId.current = '';
    document.getElementById(id)?.focus();
    return undefined;
  });

  return (id) => {
    pendingId.current = id;
  };
}

export function usePreviewSubmit() {
  const [status, setStatus] = useState('idle');
  const [liveMessage, setLiveMessage] = useState('');
  const timer = useRef(0);
  const running = useRef(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const start = (message, onDone) => {
    if (running.current) return;
    running.current = true;
    setStatus('submitting');
    setLiveMessage(message);
    timer.current = window.setTimeout(() => {
      running.current = false;
      setStatus('idle');
      setLiveMessage('');
      onDone();
    }, 600);
  };

  return { status, liveMessage, start };
}

export function validateSignup(values) {
  const errors = {};
  if (!values.email.trim()) errors.email = 'Email is required';
  else if (!isEmailAddress(values.email)) errors.email = 'Enter an email address like anna@example.com';

  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 8) errors.password = 'Use at least 8 characters';

  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password';
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Those passwords don’t match';

  return errors;
}

export function readSignUpError(error) {
  const message = typeof error?.message === 'string' && error.message.trim()
    ? error.message
    : 'Something went wrong. Please try again.';
  const code = error?.code || '';
  const fieldErrors = {};

  if (
    code === 'user_already_exists'
    || code === 'email_exists'
    || /already registered|already been registered|already exists/i.test(message)
  ) {
    fieldErrors.email = 'An account with this email already exists.';
    return { fieldErrors, formError: fieldErrors.email };
  }

  if (code === 'weak_password' || /password/i.test(message)) {
    fieldErrors.password = message;
    return { fieldErrors, formError: message };
  }

  if (code === 'email_address_invalid' || /email/i.test(message)) {
    fieldErrors.email = 'Enter an email address like anna@example.com';
    return { fieldErrors, formError: message };
  }

  return { fieldErrors, formError: message };
}

export function messagesFrom(errors, formError) {
  return [...new Set([
    formError,
    errors.email,
    errors.password,
    errors.confirmPassword,
  ].filter(Boolean))];
}



export {
  supabase
}
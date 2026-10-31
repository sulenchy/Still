import { useCallback, useEffect, useState } from 'react';
import {
  loadSubscription,
  openPortal,
  startCheckout,
  subscriptionIsOpen,
} from './api.js';

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

export function useSubscription(userId, returnKind) {
  const [row, setRow] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(returnKind === 'success');
  const [busy, setBusy] = useState('');
  const [actionError, setActionError] = useState('');

  const refresh = useCallback(async () => {
    const next = await loadSubscription();
    setRow(next);
    setStatus('ready');
    setError('');
    return next;
  }, []);

  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;

    const run = async () => {
      const polling = returnKind === 'success' || returnKind === 'portal';
      const attempts = returnKind === 'success' ? 10 : (returnKind === 'portal' ? 5 : 1);
      if (returnKind === 'success') setConfirming(true);

      try {
        for (let attempt = 0; attempt < attempts; attempt += 1) {
          const next = await loadSubscription();
          if (cancelled) return;
          setRow(next);
          setStatus('ready');
          setError('');
          if (returnKind === 'success' && subscriptionIsOpen(next)) {
            setConfirming(false);
            return;
          }
          if (returnKind === 'portal' && (next?.cancel_at_period_end || !subscriptionIsOpen(next))) {
            setConfirming(false);
            return;
          }
          if (!polling || (returnKind === 'portal' && attempt >= attempts - 1)) {
            setConfirming(false);
            return;
          }
          if (returnKind === 'success' && attempt === attempts - 1) {
            setConfirming(false);
            return;
          }
          await wait(2000);
        }
        if (!cancelled) setConfirming(false);
      } catch (cause) {
        if (cancelled) return;
        setStatus('failed');
        setError(cause?.message || 'Could not load the subscription.');
        setConfirming(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [userId, returnKind]);

  const checkout = async (interval) => {
    if (busy) return;
    setActionError('');
    setBusy(interval);
    try {
      await startCheckout(interval);
    } catch (cause) {
      setActionError(cause?.message || 'Could not start checkout.');
      setBusy('');
    }
  };

  const manage = async () => {
    if (busy) return;
    setActionError('');
    setBusy('portal');
    try {
      await openPortal();
    } catch (cause) {
      setActionError(cause?.message || 'Could not open subscription settings.');
      setBusy('');
    }
  };

  const retry = async () => {
    setStatus('loading');
    setError('');
    setActionError('');
    try {
      await refresh();
    } catch (cause) {
      setStatus('failed');
      setError(cause?.message || 'Could not load the subscription.');
    }
  };

  return {
    row,
    status,
    error,
    confirming,
    busy,
    actionError,
    isOpen: subscriptionIsOpen(row),
    checkout,
    manage,
    retry,
  };
}

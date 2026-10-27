import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { signOut as signOutRequest } from './authSlice.js';

const fallbackMessage = 'Could not log out. Please try again.';

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const status = useSelector((state) => state.auth.status);

  const signOut = useCallback(async () => {
    const result = await dispatch(signOutRequest());

    if (signOutRequest.fulfilled.match(result)) {
      return { error: null };
    }

    const message = result.payload || result.error?.message || fallbackMessage;
    return { error: { message } };
  }, [dispatch]);

  return {
    user,
    loading: status === 'initializing',
    signOut,
  };
}

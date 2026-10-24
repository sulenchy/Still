
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { supabase } from '../../lib/supabase.js';
import {
  setAuthenticated,
  setUnauthenticated,
} from './authSlice.js';

function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        dispatch(
          setAuthenticated({
            id: session.user.id,
            email: session.user.email ?? null,
          }),
        );
      } else if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_OUT'
      ) {
        dispatch(setUnauthenticated());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return null;
}

export default AuthListener;

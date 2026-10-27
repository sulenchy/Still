import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import supabase from '../../lib/supabase.js';
import {
  setAuthenticated,
  setUnauthenticated,
  toAuthUser,
} from './authSlice.js';

function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;
    let generation = 0;

    async function loadSession() {
      const current = ++generation;
      const { data, error } = await supabase.auth.getSession();

      if (!mounted || current !== generation) return;

      if (error || !data.session?.user) {
        dispatch(setUnauthenticated());
        return;
      }

      dispatch(setAuthenticated(toAuthUser(data.session.user)));
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      generation += 1;

      if (session?.user) {
        dispatch(setAuthenticated(toAuthUser(session.user)));
      } else {
        dispatch(setUnauthenticated());
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return null;
}

export default AuthListener;

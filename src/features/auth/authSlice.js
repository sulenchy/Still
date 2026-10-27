import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import supabase from '../../lib/supabase.js';

const initialState = {
  status: 'initializing',
  user: null,
};

export function toAuthUser(user) {
  return {
    id: user.id,
    email: user.email ?? null,
  };
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated(state, action) {
      state.status = 'authenticated';
      state.user = action.payload;
    },

    setUnauthenticated(state) {
      state.status = 'unauthenticated';
      state.user = null;
    },
  },
});

export const {
  setAuthenticated,
  setUnauthenticated,
} = authSlice.actions;

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      const { data } = await supabase.auth.getSession();
      const nextUser = data.session?.user ?? null;

      if (nextUser) {
        dispatch(setAuthenticated(toAuthUser(nextUser)));
        return rejectWithValue(
          error?.message || 'Could not log out. Please try again.',
        );
      }

      dispatch(setUnauthenticated());
      return null;
    } catch (cause) {
      return rejectWithValue(
        cause?.message || 'Could not log out. Please try again.',
      );
    }
  },
);

export default authSlice.reducer;

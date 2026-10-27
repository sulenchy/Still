import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import { loadArchive } from './api.js';

export const archiveCleared = createAction('archive/cleared');

export const loadArchiveForUser = createAsyncThunk(
  'archive/load',
  async (userId, { rejectWithValue }) => {
    try {
      const data = await loadArchive();
      return {
        userId,
        people: data.people,
        memories: data.memories,
        capsules: data.capsules,
      };
    } catch (error) {
      return rejectWithValue({
        userId,
        message: error?.message || 'Could not open your archive.',
      });
    }
  },
  {
    condition(userId, { getState }) {
      const state = getState();
      if (state.auth.status !== 'authenticated') return false;
      if (state.auth.user?.id !== userId) return false;

      const current = state.people;
      const settled = current.status === 'loading' || current.status === 'ready';
      return !(current.userId === userId && settled);
    },
  },
);

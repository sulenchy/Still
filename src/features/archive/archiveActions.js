import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import {
  createCapsule,
  createMemory,
  createPerson,
  loadArchive,
  roleValues,
} from './api.js';

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

function savedOrRejected(work, fallback) {
  return async (input, { rejectWithValue }) => {
    try {
      return await work(input);
    } catch (error) {
      return rejectWithValue(error?.message || fallback);
    }
  };
}

export const invitePerson = createAsyncThunk(
  'people/invite',
  savedOrRejected(
    ({ name, email, role }) => createPerson({
      name,
      email,
      role: roleValues[role] || role,
    }),
    'Could not invite that person.',
  ),
);

export const keepMemory = createAsyncThunk(
  'memories/keep',
  savedOrRejected(createMemory, 'Could not keep that moment.'),
);

export const keepCapsule = createAsyncThunk(
  'capsules/keep',
  savedOrRejected(createCapsule, 'Could not seal that capsule.'),
);

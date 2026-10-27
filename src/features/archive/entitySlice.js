import { createSlice } from '@reduxjs/toolkit';

import { archiveCleared, loadArchiveForUser } from './archiveActions.js';

function emptyEntityState() {
  return {
    status: 'idle',
    userId: null,
    error: '',
    ids: [],
    byId: {},
  };
}

function newestFirst(items) {
  return [...items].sort((left, right) => {
    const byDate = String(right.createdAt).localeCompare(String(left.createdAt));
    if (byDate !== 0) return byDate;
    return String(left.id).localeCompare(String(right.id));
  });
}

function replaceEntities(state, items) {
  state.ids = items.map((item) => item.id);
  state.byId = Object.fromEntries(items.map((item) => [item.id, item]));
  state.status = 'ready';
  state.error = '';
}

export function createEntitySlice({ name, selectItems, newest = false }) {
  return createSlice({
    name,
    initialState: emptyEntityState(),
    reducers: {},
    extraReducers(builder) {
      builder
        .addCase(loadArchiveForUser.pending, (state, action) => {
          const userId = action.meta.arg;
          if (state.userId !== userId) {
            state.ids = [];
            state.byId = {};
          }
          state.status = 'loading';
          state.userId = userId;
          state.error = '';
        })
        .addCase(loadArchiveForUser.fulfilled, (state, action) => {
          if (state.userId !== action.payload.userId) return;
          const items = selectItems(action.payload);
          replaceEntities(state, newest ? newestFirst(items) : items);
        })
        .addCase(loadArchiveForUser.rejected, (state, action) => {
          const userId = action.payload?.userId ?? action.meta.arg;
          if (state.userId !== userId) return;
          state.status = 'failed';
          state.error = action.payload?.message
            || action.error?.message
            || 'Could not open your archive.';
        })
        .addCase(archiveCleared, () => emptyEntityState());
    },
  });
}

export function selectEntities(collection) {
  return collection.ids.map((id) => collection.byId[id]);
}

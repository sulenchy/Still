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

function remember(state, item, { newest = false, place = 'end' } = {}) {
  if (!item?.id) return;
  const known = Boolean(state.byId[item.id]);
  state.byId[item.id] = item;
  if (!known) {
    if (place === 'start') state.ids.unshift(item.id);
    else state.ids.push(item.id);
  }
  if (newest) {
    const ordered = newestFirst(state.ids.map((id) => state.byId[id]));
    state.ids = ordered.map((entry) => entry.id);
  }
  state.status = 'ready';
  state.error = '';
}

export function createEntitySlice({
  name,
  selectItems,
  newest = false,
  saved = null,
  place = 'end',
}) {
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
          const incoming = selectItems(action.payload);
          const incomingIds = new Set(incoming.map((item) => item.id));
          const kept = state.ids
            .map((id) => state.byId[id])
            .filter((item) => item && !incomingIds.has(item.id));
          const items = [...incoming, ...kept];
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

      if (saved) {
        builder.addCase(saved.fulfilled, (state, action) => {
          remember(state, action.payload, { newest, place });
        });
      }
    },
  });
}

export function selectEntities(collection) {
  return collection.ids.map((id) => collection.byId[id]);
}

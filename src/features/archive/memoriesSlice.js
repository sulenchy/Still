import { attachMedia, detachMedia, keepMemory } from './archiveActions.js';
import { createEntitySlice, selectEntities } from './entitySlice.js';

const memoriesSlice = createEntitySlice({
  name: 'memories',
  selectItems: (payload) => payload.memories,
  newest: true,
  saved: keepMemory,
  place: 'start',
  extra(builder, { remember, newest, place }) {
    builder.addCase(attachMedia.fulfilled, (state, action) => {
      remember(state, action.payload, { newest, place });
    });
    builder.addCase(detachMedia.fulfilled, (state, action) => {
      remember(state, action.payload, { newest, place });
    });
  },
});

export function selectMemories(state) {
  return selectEntities(state.memories);
}

export default memoriesSlice.reducer;

import { keepMemory } from './archiveActions.js';
import { createEntitySlice, selectEntities } from './entitySlice.js';

const memoriesSlice = createEntitySlice({
  name: 'memories',
  selectItems: (payload) => payload.memories,
  newest: true,
  saved: keepMemory,
  place: 'start',
});

export function selectMemories(state) {
  return selectEntities(state.memories);
}

export default memoriesSlice.reducer;

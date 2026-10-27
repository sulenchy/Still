import { createEntitySlice, selectEntities } from './entitySlice.js';

const memoriesSlice = createEntitySlice({
  name: 'memories',
  selectItems: (payload) => payload.memories,
  newest: true,
});

export function selectMemories(state) {
  return selectEntities(state.memories);
}

export default memoriesSlice.reducer;

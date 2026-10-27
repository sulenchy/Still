import { createEntitySlice, selectEntities } from './entitySlice.js';

const capsulesSlice = createEntitySlice({
  name: 'capsules',
  selectItems: (payload) => payload.capsules,
});

export function selectCapsules(state) {
  return selectEntities(state.capsules);
}

export default capsulesSlice.reducer;

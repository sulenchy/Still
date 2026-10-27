import { keepCapsule } from './archiveActions.js';
import { createEntitySlice, selectEntities } from './entitySlice.js';

const capsulesSlice = createEntitySlice({
  name: 'capsules',
  selectItems: (payload) => payload.capsules,
  newest: true,
  saved: keepCapsule,
  place: 'start',
});

export function selectCapsules(state) {
  return selectEntities(state.capsules);
}

export default capsulesSlice.reducer;

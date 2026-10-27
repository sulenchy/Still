import { createEntitySlice, selectEntities } from './entitySlice.js';

const peopleSlice = createEntitySlice({
  name: 'people',
  selectItems: (payload) => payload.people,
});

export function selectPeople(state) {
  return selectEntities(state.people);
}

export default peopleSlice.reducer;

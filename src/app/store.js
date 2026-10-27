
import { configureStore } from '@reduxjs/toolkit';

import capsulesReducer from '../features/archive/capsulesSlice.js';
import memoriesReducer from '../features/archive/memoriesSlice.js';
import peopleReducer from '../features/archive/peopleSlice.js';
import authReducer from '../features/auth/authSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    people: peopleReducer,
    memories: memoriesReducer,
    capsules: capsulesReducer,
  },
});

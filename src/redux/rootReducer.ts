import { combineReducers } from '@reduxjs/toolkit';

import highlightReducer from './slices/highlight';
import roomReducer from './slices/roomSlice';

const rootReducer = combineReducers({
  room: roomReducer,
  highlight: highlightReducer,
});

export default rootReducer;

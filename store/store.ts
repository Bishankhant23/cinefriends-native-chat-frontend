import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import topicReducer from './slices/topicSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    topic: topicReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

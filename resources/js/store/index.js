import { configureStore } from '@reduxjs/toolkit';

import authSlice from './slices/AuthSlice';
import notificationSlice from './slices/NotificationSlice';

export const store = configureStore({
  
  reducer: {
    auth: authSlice,
    notifications: notificationSlice
  },
});
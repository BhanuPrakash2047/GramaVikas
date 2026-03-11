import { configureStore, combineReducers } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import {
  authReducer,
  diagnosticReducer,
  schemeReducer,
  emergencyReducer,
  notificationReducer,
  driverReducer,
  doctorReducer,
  ivrsReducer,
} from './slices';
import { authMiddleware } from './middleware';

// ─── Persist Configuration ───────────────────────────────────────

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['token', 'isAuthenticated', 'userName', 'profile'],
};

// ─── Root Reducer ────────────────────────────────────────────────

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  diagnostic: diagnosticReducer,
  schemes: schemeReducer,
  emergency: emergencyReducer,
  notification: notificationReducer,
  driver: driverReducer,
  doctor: doctorReducer,
  ivrs: ivrsReducer,
});

// ─── Store ───────────────────────────────────────────────────────

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist action types for serialization check
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authMiddleware),
  devTools: __DEV__,
});

export const persistor = persistStore(store);

export default store;

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import officeAuthReducer from './slices/officeAuthSlice';
import ownerAuthReducer from './slices/ownerAuthSlice';  // ✅ ADD THIS
import cartReducer from './slices/cartSlice.js';
import userExpenseReducer from '../components/owner-useReducer/userExpenseReducer.js';
import capitalReducer from '../components/owner-useReducer/capitalReducer.js';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'officeAuth', 'ownerAuth'], // ✅ ADD ownerAuth
  version: 1,
};

const rootReducer = combineReducers({
  auth: authReducer,
  officeAuth: officeAuthReducer,
  ownerAuth: ownerAuthReducer,  // ✅ ADD THIS
  cart: cartReducer,
  userExpense: userExpenseReducer,
  capital: capitalReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
        ignoredActionPaths: ['register', 'rehydrate'],
        ignoredPaths: ['_persist'],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
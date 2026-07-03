import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from './slices/ordersSlice';
import clientsReducer from './slices/clientsSlice';
import itemsReducer from './slices/itemsSlice';

export const store = configureStore({
  reducer: {
    orders: ordersReducer,
    clients: clientsReducer,
    items: itemsReducer,
  },
});

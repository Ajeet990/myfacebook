import { configureStore } from "@reduxjs/toolkit";
import { authApi, postsApi, adminApi } from "../src/services";


export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [postsApi.reducerPath]: postsApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      postsApi.middleware,
      adminApi.middleware
    ),
});

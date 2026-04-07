import { configureStore } from "@reduxjs/toolkit";
import UserReducer from "./features/UserSlice";
import adminReducer from "./features/adminSlice";

export const store = configureStore({
  reducer: {
    users: UserReducer,
    admin: adminReducer,
  },
});
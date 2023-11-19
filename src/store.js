import { configureStore } from "@reduxjs/toolkit";
import schoolReducer from "./slices/school";
import userReducer from "./slices/user";

const store = configureStore({
  reducer: {
    user: userReducer,
    school: schoolReducer,
  },
});

export default store;

import { createSlice } from "@reduxjs/toolkit";

const initialUserState = () => {
  const userJSON = localStorage.getItem("user");

  if (userJSON) {
    const user = JSON.parse(userJSON);

    if (user) {
      return user;
    }
  }

  return null;
};

const userSlice = createSlice({
  name: "user",
  initialState: initialUserState(),
  reducers: {
    updateUser: (state, action) => {
      localStorage.setItem("user", JSON.stringify(action.payload));
      return action.payload;
    },
    removeUser: (state, action) => {
      localStorage.removeItem("user");
      return null;
    },
  },
});

export const { updateUser, removeUser } = userSlice.actions;

export default userSlice.reducer;

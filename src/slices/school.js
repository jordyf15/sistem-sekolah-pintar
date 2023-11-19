import { createSlice } from "@reduxjs/toolkit";

const initialSchoolState = () => {
  const schoolJSON = localStorage.getItem("school");

  if (schoolJSON) {
    const school = JSON.parse(schoolJSON);

    if (school) return school;
  }

  return null;
};

const schoolSlice = createSlice({
  name: "school",
  initialState: initialSchoolState(),
  reducers: {
    updateSchool: (state, action) => {
      localStorage.setItem("school", JSON.stringify(action.payload));
      return action.payload;
    },
    removeSchool: (state, action) => {
      localStorage.removeItem("school");
      return null;
    },
  },
});

export const { updateSchool, removeSchool } = schoolSlice.actions;

export default schoolSlice.reducer;

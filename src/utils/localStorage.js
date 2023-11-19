export const saveUserToLocalStorage = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const saveSchoolToLocalStorage = (school) => {
  localStorage.setItem("school", JSON.stringify(school));
};

export const getUserFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export const getSchoolToLocalStorage = () => {
  return JSON.parse(localStorage.getItem("school"));
};

export const removeUserFromLocalStorage = () => {
  localStorage.removeItem("user");
};

export const removeSchoolFromLocalStorage = () => {
  localStorage.removeItem("school");
};

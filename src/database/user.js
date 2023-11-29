import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export const addUserToDB = (user) => {
  return new Promise((resolve, reject) => {
    setDoc(doc(db, "users", user.id), {
      fullname: user.fullname,
      username: user.username,
      password: user.password,
      role: user.role,
      profileImage: user.profileImage,
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log("addUserToDB", error);
        reject(error);
      });
  });
};

export const getUserByUsernameFromDB = (username) => {
  return new Promise((resolve, reject) => {
    const usersRef = collection(db, "users");

    const q = query(usersRef, where("username", "==", username), limit(1));

    getDocs(q)
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          resolve(null);
        } else {
          const doc = querySnapshot.docs[0];
          resolve({
            id: doc.id,
            ...doc.data(),
          });
        }
      })
      .catch((error) => {
        console.log("getUserByUsernameFromDB", error);
        reject(error);
      });
  });
};

export const getUserByIDFromDB = (id) => {
  return new Promise((resolve, reject) => {
    const userRef = doc(db, "users", id);

    getDoc(userRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          resolve({
            id: docSnap.id,
            ...docSnap.data(),
          });
        } else {
          resolve(null);
        }
      })
      .catch((error) => {
        console.log("getUserByIDFromDB", error);
        reject(error);
      });
  });
};

// export const getUserByIDsFromDB = (ids) => {
//   getDocs();
// };

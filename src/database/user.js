import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase";

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

export const uploadProfileImg = (img) => {
  
  
  const imgRef = ref(storage, `profile-image/${img.id}`);

  return new Promise((resolve, reject) => {
    uploadBytes(imgRef, img.image)
      .then(() => {
        console.log("image uploaded");
        resolve();
      })
      .catch((error) => {
        console.log("upload progile img error", error);
        reject(error);
      });
  });

  // uploadBytes(imgRef, img.image).then(()=>{
  //   console.log("image uploaded");
  // })
  // return true;
};

export const EditUser = (user) => {
  //console.log("USER",user);
  const editProfile = doc(db, "users", user.id);
  return new Promise((resolve, reject) => {
    updateDoc(editProfile, {
      fullname: user.fullname,
      username: user.username,
      password: user.password,
      profileImage: user.profileImage,
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log("EditUser", error);
        reject(error);
      });
  });
};


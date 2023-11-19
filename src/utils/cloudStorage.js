import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "../firebase";

// file is file from input
// path is the path saved in the firebase cloud storage

// old code
// setIsFinishUploadFile is an setState method to signal if upload file is completed
// export const uploadFile = (file, path, setIsFinishUploadFile) => {
//   if (!file) return;

//   const storageRef = ref(storage, path);
//   const uploadTask = uploadBytesResumable(storageRef, file);

//   uploadTask.on(
//     "state_changed",
//     () => {},
//     (error) => {
//       console.log("uploadFile error", error);
//     },
//     () => {
//       setIsFinishUploadFile(true);
//     }
//   );
// };

export const uploadFile = (file, path) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      () => {},
      (error) => {
        console.log("uploadFile error", error);
        reject(error);
      },
      () => {
        resolve();
      }
    );
  });
};

export const deleteFile = (path) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);

    deleteObject(storageRef)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

export const getFileDownloadLink = (path) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);

    getDownloadURL(storageRef)
      .then((downloadUrl) => {
        resolve(downloadUrl);
      })
      .catch((error) => {
        console.log("getFileDownloadUrl error", error);
        reject(error);
      });
  });
};

export const getUserProfileImagePath = (userId) => `/profile-image/${userId}`;

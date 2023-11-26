import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "../firebase";

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

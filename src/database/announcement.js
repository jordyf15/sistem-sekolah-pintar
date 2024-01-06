import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export const addAnnouncementToDB = (announcement) => {
  return new Promise((resolve, reject) => {
    setDoc(doc(db, "announcements", announcement.id), {
      title: announcement.title,
      description: announcement.description,
      createdAt: announcement.createdAt,
      classCourseId: announcement.classCourseId,
    })
      .then(() => resolve())
      .catch((error) => {
        console.log("addAnnouncementToDB error", error);
        reject(error);
      });
  });
};

export const getAnnouncementsFromDB = (classCourseId) => {
  return new Promise((resolve, reject) => {
    const announcementsRef = collection(db, "announcements");

    const q = query(
      announcementsRef,
      where("classCourseId", "==", classCourseId),
      orderBy("createdAt", "desc")
    );

    getDocs(q)
      .then((querySnapshot) => {
        const announcements = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const announcement = {
            id: doc.id,
            title: data.title,
            description: data.description,
            classCourseId: data.classCourseId,
            createdAt: data.createdAt,
          };

          return announcement;
        });

        resolve(announcements);
      })
      .catch((error) => {
        console.log("getClassCourseAnnouncementsFromDB error", error);
        reject(error);
      });
  });
};

export const deleteAnnouncementInDB = (announcementId) => {
  return new Promise((resolve, reject) => {
    deleteDoc(doc(db, "annoucements", announcementId))
      .then(() => resolve())
      .catch((error) => {
        console.log("deleteAnnouncementInDB error", error);
        reject(error);
      });
  });
};

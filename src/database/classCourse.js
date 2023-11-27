import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export const addClassCourseToDB = (classCourse) => {
  return new Promise((resolve, reject) => {
    setDoc(doc(db, "classcourses", classCourse.id), {
      className: classCourse.className,
      courseName: classCourse.courseName,
      studentIds: classCourse.studentIds,
      teacherId: classCourse.teacherId,
      isActive: classCourse.isActive,
      schoolYear: classCourse.schoolYear,
      joinCode: classCourse.joinCode,
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log("addClassCourseToDB error", error);
        reject(error);
      });
  });
};

export const getTeacherClassCoursesFromDB = (teacherId) => {
  return new Promise((resolve, reject) => {
    const classCoursesRef = collection(db, "classcourses");

    const q = query(classCoursesRef, where("teacherId", "==", teacherId));

    getDocs(q)
      .then((querySnapshot) => {
        const classCourses = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const classCourse = {
            id: doc.id,
            className: data.className,
            courseName: data.courseName,
            teacherId: data.teacherId,
            studentIds: data.studentIds,
            isActive: data.isActive,
            schoolYear: data.schoolYear,
            joinCode: data.joinCode,
          };

          return classCourse;
        });

        resolve(classCourses);
      })
      .catch((error) => {
        console.log("getTeacherClassCoursesFromDB", error);
        reject(error);
      });
  });
};

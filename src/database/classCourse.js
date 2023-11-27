import { doc, setDoc } from "firebase/firestore";
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

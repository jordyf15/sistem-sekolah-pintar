import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const addClassCourseScoreToDB = (classCourseScore) => {
  return new Promise((resolve, reject) => {
    setDoc(doc(db, "classCourseScores", classCourseScore.id), {
      name: classCourseScore.name,
      classCourseId: classCourseScore.classCourseId,
      createdAt: classCourseScore.createdAt,
    })
      .then(() => resolve())
      .catch((error) => {
        console.log("addClassCourseScoreToDB error", error);
        reject(error);
      });
  });
};

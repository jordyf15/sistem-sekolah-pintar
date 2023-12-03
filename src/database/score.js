import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export const addScoreToDB = (score) => {
  return new Promise((resolve, reject) => {
    setDoc(doc(db, "scores", score.id), {
      name: score.name,
      classCourseId: score.classCourseId,
      createdAt: score.createdAt,
    })
      .then(() => resolve())
      .catch((error) => {
        console.log("adScoreToDB error", error);
        reject(error);
      });
  });
};

export const getClassCourseScoresFromDB = (classCourseId) => {
  return new Promise((resolve, reject) => {
    const scoresRef = collection(db, "scores");

    const q = query(
      scoresRef,
      where("classCourseId", "==", classCourseId),
      orderBy("createdAt", "asc")
    );

    getDocs(q)
      .then((querySnapshot) => {
        const scores = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const score = {
            id: doc.id,
            name: data.name,
            classCourseId: data.classCourseId,
            createdAt: data.createdAt,
          };

          return score;
        });

        resolve(scores);
      })
      .catch((error) => {
        console.log("getClassCourseScoresFromDB error", error);
        reject(error);
      });
  });
};

export const updateScoreInDB = (scoreId, scoreName) => {
  return new Promise((resolve, reject) => {
    const scoreRef = doc(db, "scores", scoreId);

    updateDoc(scoreRef, {
      name: scoreName,
    })
      .then(() => resolve())
      .catch((error) => {
        console.log("updateScoreInDB error", error);
        reject(error);
      });
  });
};

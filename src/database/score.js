import {
  collection,
  deleteDoc,
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

export const getStudentScoresByScoreIdFromDB = (scoreIds) => {
  return new Promise((resolve, reject) => {
    if (scoreIds.length === 0) resolve([]);
    const studentScoresRef = collection(db, "studentScores");

    const q = query(studentScoresRef, where("scoreId", "in", scoreIds));

    getDocs(q)
      .then((querySnapshot) => {
        const studentScores = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const studentScore = {
            id: doc.id,
            studentId: data.studentId,
            scoreId: data.scoreId,
            score: data.score,
          };

          return studentScore;
        });

        resolve(studentScores);
      })
      .catch((error) => {
        console.log("getStudentScoresByScoreIdFromDB error", error);
        reject(error);
      });
  });
};

export const upsertStudentScoreToDB = (studentScore) => {
  return new Promise((resolve, reject) => {
    setDoc(doc(db, "studentScores", studentScore.id), {
      studentId: studentScore.studentId,
      scoreId: studentScore.scoreId,
      score: studentScore.score,
    })
      .then(() => resolve())
      .catch((error) => {
        console.log("upsertStudentScoreToDB error", error);
        reject(error);
      });
  });
};

export const deleteStudentScoreInDB = (studentScoreId) => {
  return new Promise((resolve, reject) => {
    deleteDoc(doc(db, "studentScores", studentScoreId))
      .then(() => resolve())
      .catch((error) => {
        console.log("deleteStudentScoreInDB error", error);
        reject(error);
      });
  });
};

export const deleteScoreInDB = (scoreId) => {
  return new Promise((resolve, reject) => {
    deleteDoc(doc(db, "scores", scoreId))
      .then(() => resolve())
      .catch((error) => {
        console.log("deleteScoreInDB error", error);
        reject(error);
      });
  });
};

export const getStudentScoresByScoreIdsAndStudentId = (scoreIds, studentId) => {
  return new Promise((resolve, reject) => {
    if (scoreIds.length === 0) resolve([]);

    const studentScoresRef = collection(db, "studentScores");

    const q = query(
      studentScoresRef,
      where("studentId", "==", studentId),
      where("scoreId", "in", scoreIds)
    );

    getDocs(q)
      .then((querySnapshot) => {
        const studentScores = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const studentScore = {
            id: doc.id,
            studentId: data.studentId,
            scoreId: data.scoreId,
            score: data.score,
          };

          return studentScore;
        });

        resolve(studentScores);
      })
      .catch((error) => {
        console.log("getStudentScoresByScoreIdsAndStudentId error", error);
        reject(error);
      });
  });
};

export const getScoresByClassCourseIdsFromDB = (classCourseIds) => {
  return new Promise((resolve, reject) => {
    if (classCourseIds.length === 0) resolve([]);

    const scoresRef = collection(db, "scores");

    const q = query(scoresRef, where("classCourseId", "in", classCourseIds));

    getDocs(q)
      .then((querySnapshot) => {
        const scores = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const score = {
            id: doc.id,
            ...data,
          };

          return score;
        });

        resolve(scores);
      })
      .catch((error) => {
        console.log("getScoreByClassCourseIdsFromDB error", error);
        reject(error);
      });
  });
};

export const getStudentScoresByStudentId = (studentId) => {
  return new Promise((resolve, reject) => {
    const studentScoresRef = collection(db, "studentScores");

    const q = query(studentScoresRef, where("studentId", "==", studentId));

    getDocs(q)
      .then((querySnapshot) => {
        const studentScores = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const studentScore = {
            id: doc.id,
            ...data,
          };

          return studentScore;
        });

        resolve(studentScores);
      })
      .catch((error) => {
        console.log("getStudentScoresByStudentId error", error);
        reject(error);
      });
  });
};

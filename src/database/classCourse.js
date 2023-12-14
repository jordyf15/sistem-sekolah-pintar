import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
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

export const updateClassCourseInDB = (classCourse) => {
  return new Promise((resolve, reject) => {
    const classCourseRef = doc(db, "classcourses", classCourse.id);

    updateDoc(classCourseRef, {
      className: classCourse.className,
      courseName: classCourse.courseName,
      isActive: classCourse.isActive,
      schoolYear: classCourse.schoolYear,
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log("updateClassCourseInDB", error);
        reject(error);
      });
  });
};

export const updateClassCourseStudentsInDB = (classCourseId, studentIds) => {
  return new Promise((resolve, reject) => {
    const classCourseRef = doc(db, "classcourses", classCourseId);

    updateDoc(classCourseRef, {
      studentIds: studentIds,
    })
      .then(() => resolve())
      .catch((error) => {
        console.log("updateClassCourseStudentsInDB error", error);
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

export const getClassCourseByJoinCodeFromDB = (joinCode) => {
  return new Promise((resolve, reject) => {
    const classCoursesRef = collection(db, "classcourses");

    const q = query(classCoursesRef, where("joinCode", "==", joinCode));

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
        console.log("getClassCourseByJoinCodeFromDB", error);
        reject(error);
      });
  });
};

export const getStudentClassCoursesFromDB = (studentId) => {
  return new Promise((resolve, reject) => {
    const classCoursesRef = collection(db, "classcourses");

    const q = query(
      classCoursesRef,
      where("studentIds", "array-contains", studentId)
    );

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
        console.log("getStudentClassCoursesFromDB", error);
        reject(error);
      });
  });
};

export const getClassCourseByIDFromDB = (id) => {
  return new Promise((resolve, reject) => {
    const classCourseRef = doc(db, "classcourses", id);

    getDoc(classCourseRef)
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
        console.log("getClassCourseByIDFromDB", error);
        reject(error);
      });
  });
};

export const deleteClassCourseInDB = (classCourseId) => {
  return new Promise((resolve, reject) => {
    deleteDoc(doc(db, "classcourses", classCourseId))
      .then(() => resolve())
      .catch((error) => {
        console.log("deleteClassCourseInDB error", error);
        reject(error);
      });
  });
};

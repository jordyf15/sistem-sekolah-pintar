import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export const addAssignmentToDB = (assignment) => {
  return new Promise((resolve, reject) => {
    const addedAssignment = {
      title: assignment.title,
      description: assignment.description,
      deadline: assignment.deadline,
      createdAt: assignment.createdAt,
      classCourseId: assignment.classCourseId,
      attachment: assignment.attachment,
    };

    setDoc(doc(db, "assignments", assignment.id), addedAssignment)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log("addAssignmentToDB error", error);
        reject(error);
      });
  });
};

export const addAnswerToDb = (answer) => {
  return new Promise((resolve, reject) => {
    setDoc(doc(db, "answers", answer.id), {
      assignmentId: answer.assignmentId,
      studentId: answer.studentId,
      attachment: answer.attachment,
      createdAt: answer.createdAt,
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log("addAnswerToDb error", error);
        reject(error);
      });
  });
};

export const deleteAnswerInDB = (answerId) => {
  return new Promise((resolve, reject) => {
    deleteDoc(doc(db, "answers", answerId))
      .then(() => resolve())
      .catch((error) => {
        console.log("deleteAnswerInDB error", error);
        reject(error);
      });
  });
};

export const deleteAssignmentInDB = (assignmentId) => {
  return new Promise((resolve, reject) => {
    deleteDoc(doc(db, "assignments", assignmentId))
      .then(() => resolve())
      .catch((error) => {
        console.log("deleteAssignmentInDB error", error);
        reject(error);
      });
  });
};

export const updateAssignmentInDB = (assignment) => {
  const assignmentRef = doc(db, "assignments", assignment.id);
  return new Promise((resolve, reject) => {
    updateDoc(assignmentRef, {
      title: assignment.title,
      description: assignment.description,
      attachment: assignment.attachment,
      deadline: assignment.deadline,
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log("editAssignment error", error);
        reject(error);
      });
  });
};

//this is to get all answer of assignment for teacher
export const getAssignmentAnswersFromDB = (assignmentId) => {
  return new Promise((resolve, reject) => {
    const answersRef = collection(db, "answers");

    const q = query(
      answersRef,
      where("assignmentId", "==", assignmentId),
      orderBy("createdAt", "asc")
    );

    getDocs(q)
      .then((querySnapshot) => {
        const answers = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          const answer = {
            id: doc.id,
            assignmentId: data.assignmentId,
            attachment: data.attachment,
            createdAt: data.createdAt.toDate(),
            studentId: data.studentId,
          };

          return answer;
        });

        resolve(answers);
      })
      .catch((error) => {
        console.log("getAssignmentAnswersFromDB error", error);
        reject(error);
      });
  });
};

export const getAnswerByIdFromDB = (assignmentUserId) => {
  return new Promise((resolve, reject) => {
    const answerRef = doc(db, "answers", assignmentUserId);
    getDoc(answerRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const answer = {
            id: snapshot.id,
            assignmentId: data.assignmentId,
            attachment: data.attachment,
            createdAt: data.createdAt.toDate(),
            studentId: data.studentId,
          };
          resolve(answer);
        } else {
          resolve(null);
        }
      })
      .catch((error) => {
        console.log("getAnswerByIdDB error", error);
        reject(error);
      });
  });
};

export const getAssignmentByIdFromDB = (id) => {
  return new Promise((resolve, reject) => {
    const asgRef = doc(db, "assignments", id);

    getDoc(asgRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          resolve({
            id: docSnap.id,
            title: data.title,
            description: data.description,
            deadline: data.deadline.toDate(),
            createdAt: data.createdAt.toDate(),
            classCourseId: data.classCourseId,
            attachment: data.attachment,
          });
        } else {
          resolve(null);
        }
      })
      .catch((error) => {
        console.log("getAssignmentByIdFromDB error", error);
        reject(error);
      });
  });
};

export const getClassCourseAssignmentsFromDB = (classCourseId) => {
  return new Promise((resolve, reject) => {
    const assignmentRef = collection(db, "assignments");
    const q = query(
      assignmentRef,
      where("classCourseId", "==", classCourseId),
      orderBy("createdAt", "desc")
    );

    getDocs(q)
      .then((querySnapshot) => {
        const assignments = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const assignment = {
            id: doc.id,
            title: data.title,
            description: data.description,
            deadline: data.deadline.toDate(),
            createdAt: data.createdAt.toDate(),
            classCourseId: data.classCourseId,
            attachment: data.attachment,
          };

          return assignment;
        });
        resolve(assignments);
      })
      .catch((error) => {
        console.log("getClassCourseAssignmentsFromDB error", error);
        reject(error);
      });
  });
};

export const getAnswersByAssignmentIdsAndStudentId = (
  assignmentIds,
  studentId
) => {
  return new Promise((resolve, reject) => {
    if (assignmentIds.length === 0) resolve([]);

    const answersRef = collection(db, "answers");

    const q = query(
      answersRef,
      where("studentId", "==", studentId),
      where("assignmentId", "in", assignmentIds)
    );

    getDocs(q)
      .then((querySnapshot) => {
        const answers = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const answer = {
            id: doc.id,
            assignmentId: data.assignmentId,
            studentId: data.studentId,
            attachment: data.attachment,
            createdAt: data.createdAt.toDate(),
          };

          return answer;
        });
        resolve(answers);
      })
      .catch((error) => {
        console.log("getAnswersByAssignmentIdsAndStudentId error", error);
        reject(error);
      });
  });
};

export const getAnswersByAssignmentIdsFromDB = (assignmentIds) => {
  return new Promise((resolve, reject) => {
    if (assignmentIds.length === 0) resolve([]);

    const answersRef = collection(db, "answers");
    const q = query(answersRef, where("assignmentId", "in", assignmentIds));

    getDocs(q)
      .then((querySnapshot) => {
        const answers = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const answer = {
            id: doc.id,
            assignmentId: data.assignmentId,
            studentId: data.studentId,
            attachment: data.attachment,
            createdAt: data.createdAt,
          };

          return answer;
        });
        resolve(answers);
      })
      .catch((error) => {
        console.log("getAnswersByAssignmentIdsFromDB error", error);
        reject(error);
      });
  });
};

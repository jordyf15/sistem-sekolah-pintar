import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

export const addUserToDB = async (user) => {
  try {
    await setDoc(doc(db, "users", user.id), {
      fullname: user.fullname,
      username: user.username,
      phonenumber: user.phonenumber,
      password: user.password,
      schoolId: user.schoolId,
      role: user.role,
      profileImage: user.profileImage,
    });
  } catch (error) {
    throw error;
  }
};

export const addStudentParent = async (studentParent) => {
  try {
    await setDoc(doc(db, "studentparents", studentParent.id), {
      parentId: studentParent.parentId,
      studentIds: studentParent.studentIds,
    });
  } catch (error) {
    throw error;
  }
};

export const addSchoolToDB = async (school) => {
  try {
    await setDoc(doc(db, "schools", school.id), {
      name: school.name,
      currentSchoolYear: school.currentSchoolYear,
    });
  } catch (error) {
    throw error;
  }
};

export const addClassToDB = async (_class) => {
  try {
    await setDoc(doc(db, "classes", _class.id), {
      name: _class.name,
      homeroomTeacherId: _class.homeroomTeacherId,
      schoolYear: _class.schoolYear,
      schoolId: _class.schoolId,
      studentIds: _class.studentIds,
    });
  } catch (error) {
    throw error;
  }
};

export const addCourseToDB = async (course) => {
  try {
    await setDoc(doc(db, "courses", course.id), {
      name: course.name,
      teacherId: course.teacherId,
      schoolId: course.schoolId,
    });
  } catch (error) {
    throw error;
  }
};

export const addClassCoursesToDB = async (classCourses) => {
  try {
    const batch = writeBatch(db);
    classCourses.forEach((classCourse) => {
      const classCourseRef = doc(db, "classcourses", classCourse.id);
      batch.set(classCourseRef, {
        classId: classCourse.classId,
        courseId: classCourse.courseId,
      });
    });
    await batch.commit();
  } catch (error) {
    throw error;
  }
};

export const addAnnouncementToDB = async (announcement) => {
  try {
    await setDoc(doc(db, "announcements", announcement.id), {
      title: announcement.title,
      description: announcement.description,
      createdAt: announcement.createdAt,
      target: announcement.target,
      targetIds: announcement.targetIds,
      schoolId: announcement.schoolId,
      attachments: announcement.attachments,
    });
  } catch (error) {
    throw error;
  }
};

export const addScheduleToDB = async (schedule) => {
  try {
    await setDoc(doc(db, "schedules", schedule.id), {
      classCourseId: schedule.classCourseId,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
  } catch (error) {
    throw error;
  }
};

export const getUserByUsernameFromDB = async (username) => {
  try {
    const usersRef = collection(db, "users");

    const q = query(usersRef, where("username", "==", username), limit(1));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    } else {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    }
  } catch (error) {
    throw error;
  }
};

export const getSchoolByIdFromDB = async (id) => {
  try {
    const docRef = doc(db, "schools", id);
    const docSnap = await getDoc(docRef);

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    throw error;
  }
};

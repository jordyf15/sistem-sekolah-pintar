import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export const addAgendaToDB = (agenda) => {
  return new Promise((resolve, reject) => {
    setDoc(doc(db, "agendas", agenda.id), {
      title: agenda.title,
      description: agenda.description,
      date: agenda.date,
      classCourseId: agenda.classCourseId,
    })
      .then(() => resolve())
      .catch((error) => {
        console.log("addAgendaToDB error", error);
        reject(error);
      });
  });
};

export const getClassCourseAgendasFromDB = (classCourseId) => {
  return new Promise((resolve, reject) => {
    const agendasRef = collection(db, "agendas");

    const q = query(agendasRef, where("classCourseId", "==", classCourseId));

    getDocs(q)
      .then((querySnapshot) => {
        const agendas = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const agenda = {
            id: doc.id,
            title: data.title,
            description: data.description,
            date: data.date.toDate(),
            classCourseId: data.classCourseId,
          };

          return agenda;
        });

        resolve(agendas);
      })
      .catch((error) => {
        console.log("getClassCourseAgendasFromDB error", error);
        reject(error);
      });
  });
};

export const deleteAgendaInDB = (agendaId) => {
  return new Promise((resolve, reject) => {
    deleteDoc(doc(db, "agendas", agendaId))
      .then(() => resolve())
      .catch((error) => {
        console.log("deleteAgendaInDB error", error);
        reject(error);
      });
  });
};

export const updateAgendaInDB = (agenda) => {
  return new Promise((resolve, reject) => {
    const agendaRef = doc(db, "agendas", agenda.id);

    updateDoc(agendaRef, {
      title: agenda.title,
      description: agenda.description,
      date: agenda.date,
    })
      .then(() => resolve())
      .catch((error) => {
        console.log("updateAgendaInDB", error);
        reject(error);
      });
  });
};

export const getAgendasByClassCourseIdsFromDB = (classCourseIds) => {
  return new Promise((resolve, reject) => {
    if (classCourseIds.length === 0) resolve([]);

    const agendasRef = collection(db, "agendas");

    const q = query(agendasRef, where("classCourseId", "in", classCourseIds));

    getDocs(q)
      .then((querySnapshot) => {
        const agendas = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const agenda = {
            id: doc.id,
            ...data,
          };

          return agenda;
        });

        resolve(agendas);
      })
      .catch((error) => {
        console.log("getAgendasByClassCourseIdsFromDB error", error);
        reject(error);
      });
  });
};

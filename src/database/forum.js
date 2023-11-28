import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export const getClassCourseThreadsFromDB = (classCourseId) => {
  return new Promise((resolve, reject) => {
    const threadsRef = collection(db, "threads");

    const q = query(threadsRef, where("classCourseId", "==", classCourseId));

    getDocs(q)
      .then((querySnapshot) => {
        const threads = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const thread = {
            id: doc.id,
            title: data.title,
            description: data.description,
            creatorId: data.creatorId,
            createdAt: data.createdAt,
            classCourseId: data.classCourseId,
            attachments: data.attachments,
          };

          return thread;
        });

        resolve(threads);
      })
      .catch((error) => {
        console.log("getClassCourseThreads", error);
        reject(error);
      });
  });
};

export const addThreadToDB = (thread) => {
  return new Promise((resolve, reject) => {
    setDoc(doc(db, "threads", thread.id), {
      title: thread.title,
      description: thread.description,
      creatorId: thread.creatorId,
      createdAt: thread.createdAt,
      classCourseId: thread.classCourseId,
      attachments: thread.attachments,
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log("addThreadToDB error", error);
        reject(error);
      });
  });
};

export const getThreadRepliesFromDB = (threadId) => {
  return new Promise((resolve, reject) => {
    const repliesRef = collection(db, "replies");

    const q = query(repliesRef, where("threadId", "==", threadId));

    getDocs(q)
      .then((querySnapshot) => {
        const replies = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          const reply = {
            id: doc.id,
            reply: data.reply,
            threadId: data.threadId,
            creatorId: data.creatorId,
            createdAt: data.createdAt,
            attachments: data.attachments,
          };

          return reply;
        });

        resolve(replies);
      })
      .catch((error) => {
        console.log("getThreadRepliesFromDB error", error);
        reject(error);
      });
  });
};

export const updateThreadInDB = (thread) => {
  return new Promise((resolve, reject) => {
    const threadRef = doc(db, "threads", thread.id);

    updateDoc(threadRef, {
      title: thread.title,
      description: thread.description,
      attachments: thread.attachments,
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log("updateThreadInDB", error);
        reject(error);
      });
  });
};
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const addTopicToDB = (topic) => {
  return new Promise((resolve, reject) => {
    setDoc(doc(db, "topics", topic.id), {
      name: topic.name,
      checked: topic.checked,
      classCourseId: topic.classCourseId,
      materials: topic.materials,
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.log("addTopicToDB error", error);
        reject(error);
      });
  });
};

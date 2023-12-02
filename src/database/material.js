import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export const addTopicToDB = (topic) => {
  return new Promise((resolve, reject) => {
    setDoc(doc(db, "topics", topic.id), {
      name: topic.name,
      checked: topic.checked,
      classCourseId: topic.classCourseId,
      materials: topic.materials,
      createdAt: topic.createdAt,
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

export const getClassCourseTopicsFromDB = (classCourseId) => {
  return new Promise((resolve, reject) => {
    const topicsRef = collection(db, "topics");

    const q = query(
      topicsRef,
      where("classCourseId", "==", classCourseId),
      orderBy("createdAt", "desc")
    );

    getDocs(q)
      .then((querySnapshot) => {
        const topics = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const topic = {
            id: doc.id,
            name: data.name,
            checked: data.checked,
            classCourseId: data.classCourseId,
            createdAt: data.createdAt,
            materials: data.materials,
          };

          return topic;
        });

        resolve(topics);
      })
      .catch((error) => {
        console.log("getClassCourseTopicsFromDB", error);
        reject(error);
      });
  });
};

export const upsertTopicMaterialInDB = (topicId, material) => {
  return new Promise((resolve, reject) => {
    const updatedTopicRef = doc(db, "topics", topicId);

    const materialData = {};

    materialData.name = material.name;

    if (material.fileName) {
      materialData.fileName = material.fileName;
    } else {
      materialData.link = material.link;
    }

    updateDoc(updatedTopicRef, {
      [`materials.${material.id}`]: materialData,
    })
      .then(() => resolve())
      .catch((error) => {
        console.log("upsertTopicMaterialInDB error", error);
        reject(error);
      });
  });
};

export const updateTopicInDB = (topicId, topicName) => {
  return new Promise((resolve, reject) => {
    const topicRef = doc(db, "topics", topicId);

    updateDoc(topicRef, {
      name: topicName,
    })
      .then(() => resolve())
      .catch((error) => {
        console.log("updateTopicInDB", error);
        reject(error);
      });
  });
};

export const deleteTopicMaterialInDB = (topicId, materialId) => {
  return new Promise((resolve, reject) => {
    const topicRef = doc(db, "topics", topicId);
    updateDoc(topicRef, {
      [`materials.${materialId}`]: deleteField(),
    })
      .then(() => resolve())
      .catch((error) => {
        console.log("deleteTopicMaterialInDB", error);
        reject(error);
      });
  });
};

export const deleteTopicInDB = (topicId) => {
  return new Promise((resolve, reject) => {
    deleteDoc(doc(db, "topics", topicId))
      .then(() => resolve())
      .catch((error) => {
        console.log("deleteTopicInDB", error);
        reject(error);
      });
  });
};

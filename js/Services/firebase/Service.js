import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  writeBatch,
} from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';
import { db } from './firebase-init.js';

export class FirestoreService {
  constructor(uid) {
    this.uid = uid;
  }

  async addCollection(data, collectionName) {
    if (!data || !collectionName) {
      throw new Error('Collection name and data are required.');
    }

    try {
      const ref = collection(db, `users/${this.uid}/${collectionName}`);
      const docRef = await addDoc(ref, {
        ...data,
        createdAt: serverTimestamp(),
        isActive: false,
      });
      return docRef.id;
    } catch (error) {
      console.error('ADD COLLECTION ERROR:', error);
      return null;
    }
  }

  async updateCollection(updateObj, collectionName, docId) {
    if (!collectionName || !updateObj) {
      throw new Error('Collection name, doc ID, and data object are required');
    }

    try {
      const collectionRef = doc(
        db,
        `users/${this.uid}/${collectionName}/${docId}`
      );
      const docQuery = await updateDoc(collectionRef, updateObj);
    } catch (err) {
      console.error('UPDATE ERROR:', err);
    }
  }

  async loadUserCollection(collectionName) {
    if (!collectionName) {
      throw new Error('A collection name must be provided to fetch data');
    }
    try {
      const collectionRef = collection(
        db,
        `users/${this.uid}/${collectionName}`
      );
      const docQuery = await getDocs(collectionRef);
      const collections = [];
      docQuery.forEach((doc) => {
        collections.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return collections;
    } catch (error) {
      console.error('COLLECTION  FETCH ERROR:', error);
      return [];
    }
  }

  async deleteDocument(docId, collectionName) {
    if (!docId || !collectionName) {
      throw new Error('Collection name and ID are required.');
    }

    try {
      const docRef = doc(db, `users/${this.uid}/${collectionName}/${docId}`);
      await deleteDoc(docRef);

      return true;
    } catch (error) {
      console.error('DELETE DOCUMENT ERROR:', error);
      return false;
    }
  }

  async addCollectionElement(data, collectionName, subCollection) {
    if (!data || !collectionName) {
      throw new Error('Missing required parameters: Collection name and data.');
    }

    try {
      const itemID = data.roadmapID.replace('ul-', '');
      const collectionRef = collection(
        db,
        `users/${this.uid}/${collectionName}/${itemID}/${subCollection}`
      );
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('ADD COLLECTION ERROR:', error);
      return null;
    }
  }
  async batchAddNodes(roadmapId, nodesData, collectionName, subCollection) {
    if (
      !nodesData ||
      nodesData.length === 0 ||
      !roadmapId ||
      !collectionName ||
      !subCollection
    ) {
      throw new Error('Missing items for batching!');
    }
    try {
      const roadmapID = roadmapId.replace('ul-', '');
      const batch = writeBatch(db);
      const allData = [];
      nodesData.forEach((nodeData) => {
        const docRef = doc(
          collection(
            db,
            `users/${this.uid}/${collectionName}/${roadmapID}/${subCollection}`
          )
        );
        const newID = docRef.id;

        const fullData = {
          ...nodeData,
          id: newID,
          createdAt: serverTimestamp(),
        };

        if (!fullData.id) throw new Error('Invalid ID');

        allData.push(fullData);
        batch.set(docRef, fullData);
      });

      await batch.commit();
      return allData;
    } catch (error) {
      console.error('BATCH ERROR:', error);
    }
  }
  //metoda odczytująca elementy z danej kolekcji
  async getElementsfromSubCollection(roadmapID, collectionName, subCollection) {
    if (!collectionName || !subCollection) {
      throw new Error('Collection name and subcollection name are required.');
    }
    try {
      const roadmapId = roadmapID.replace('ul-', '');
      const collectionRef = collection(
        db,
        `users/${this.uid}/${collectionName}/${roadmapId}/${subCollection}`
      );
      const docQuery = await getDocs(collectionRef);
      const elements = [];
      docQuery.forEach((doc) => {
        elements.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return elements;
    } catch (error) {
      console.error('LOAD COLLECTION ERROR:', error);
      return [];
    }
  }

  async updateElements(
    roadmapID,
    collectionName,
    subCollection,
    nodeID,
    updateObj
  ) {
    if (!collectionName || !subCollection || !nodeID || !updateObj) {
      throw new Error(
        'Collection name, subcollection, node ID, and data object are required.'
      );
    }
    try {
      const roadmapId = roadmapID.replace('ul-', '');
      const collectionRef = doc(
        db,
        `users/${this.uid}/${collectionName}/${roadmapId}/${subCollection}/${nodeID}`
      );
      const docQuery = await updateDoc(collectionRef, updateObj);
    } catch (err) {
      console.error('UPDATE ERROR:', err);
    }
  }
  //metoda Kasująca element subkolekcji
  async deleteElement(docId, collectionName, subCollection, nodeID) {
    if (!docId || !collectionName || !subCollection || !nodeID) {
      throw new Error('Missing required data to delete subcollection element.');
    }
    try {
      const roadmapId = docId.replace('ul-', '');
      const docRef = doc(
        db,
        `users/${this.uid}/${collectionName}/${roadmapId}/${subCollection}/${nodeID}`
      );
      await deleteDoc(docRef);

      return true;
    } catch (error) {
      console.error('DELETE DOC ERROR:', error);
      return false;
    }
  }

  listenToCollection(
    roadmapID,
    collectionName,
    subCollection,
    callbacks = {
      onAdd: () => {},
      onModify: () => {},
      onRemove: () => {},
    }
  ) {
    if (!collectionName || !subCollection || !roadmapID) {
      throw new Error('No data to listen to in real-time!');
    }
    try {
      const roadmapId = roadmapID.replace('ul-', '');
      const collectionRef = collection(
        db,
        `users/${this.uid}/${collectionName}/${roadmapId}/${subCollection}`
      );
      const unsub = onSnapshot(
        collectionRef,
        (onData) => {
          onData.docChanges().forEach((change) => {
            if (change.type === 'added') {
              callbacks.onAdd(change.doc.data());
            }
            if (change.type === 'modified') {
              callbacks.onModify(change.doc.data());
            }
            if (change.type === 'removed') {
              callbacks.onRemove(change.doc.data());
            }
          });
        },
        (onError) => {
          console.warn('ERROR!:', onError);
        }
      );
      return unsub;
    } catch (err) {
      console.error('REAL-TIME ERROR:', err);
    }
  }

  listenToElement(
    roadmapID,
    collectionName,
    subCollection,
    nodeID,
    callbacks = {
      onUpdate: () => {},
      onDelete: () => {},
    }
  ) {
    if (!collectionName || !subCollection || !roadmapID || !nodeID) {
      throw new Error(
        'Collection name, subcollection, node ID, and data object are required.'
      );
    }

    try {
      const roadmapId = roadmapID.replace('ul-', '');
      const docRef = doc(
        db,
        `users/${this.uid}/${collectionName}/${roadmapId}/${subCollection}/${nodeID}`
      );
      const unsub = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists() === true) {
            if (typeof callbacks.onUpdate === 'function') {
              callbacks.onUpdate(snapshot.data());
            }
          }
          if (snapshot.exists() === false) {
            console.warn('No data from snapshot, ondelete initiated.');

            if (typeof callbacks.onDelete === 'function') {
              callbacks.onDelete();
            }
          }
        },
        (onError) => {
          console.error('Error listening to element!', onError);
        }
      );
      return unsub;
    } catch (err) {
      console.error('REAL-TIME LISTENER ERROR:', err);
    }
  }

  async moveElementToFinished(dataObj, refObj, copyRefObj) {
    try {
      const newId = await this.addCollectionElement(
        dataObj,
        copyRefObj.collection,
        copyRefObj.subCollection
      );

      if (!newId) {
        throw new Error('Failed to move element - save operation failed.');
      }
      const deletedDoc = await this.deleteElement(
        dataObj.roadmapID,
        refObj.collection,
        refObj.subCollection,
        dataObj.id
      );
      if (!deletedDoc) {
        throw new Error('Failed to delete the original element!');
      }

      if (newId && deletedDoc) {
        return true;
      }
    } catch (error) {
      console.error('FAILED TO MOVE ELEMENT:', error);
      return false;
    }
  }
}

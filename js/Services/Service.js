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
import { db } from '../firebase-init.js';

export class FirestoreService {
  constructor(uid) {
    this.uid = uid;
  }

  // Metoda dodwania kolekcji do fire base
  async addCollection(data, collectionName) {
    if (!data || !collectionName) {
      throw new Error('data i nazwa Kolekcji jest wymagana');
    }
    console.log('typeof data.title:', typeof this.uid);
    console.log('data.title:', data.title);

    try {
      const ref = collection(db, `users/${this.uid}/${collectionName}`);
      const docRef = await addDoc(ref, {
        ...data,
        createdAt: serverTimestamp(),
        isActive: false,
      });
      return docRef.id;
    } catch (error) {
      console.error('błąd dodawania do firestore:', error);
      return null;
    }
  }
  //Metoda odczytu Kolekcji
  async loadUserCollection(collectionName) {
    if (!collectionName) {
      throw new Error('nazwa Kolekcji do odczytu danych jest wymagana');
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

      console.log(`kolekcje ${this.uid}:`, collections);
      return collections;
    } catch (error) {
      console.error('błąd przy odczycie  od firestore:', error);
      return [];
    }
  }
  //metoda Kasująca kolekcje
  async deleteDocument(docId, collectionName) {
    if (!docId || !collectionName) {
      throw new Error('ID i nazwa Kolekcji jest wymagana');
    }

    try {
      const docRef = doc(db, `users/${this.uid}/${collectionName}/${docId}`);
      await deleteDoc(docRef);
      console.log(`Usunięto dokument ${docId} z kolekcji ${collectionName}`);
      return true;
    } catch (error) {
      console.error('bład przy usuwaniu zadania:', error);
      return false;
    }
  }

  // metoda dodajca element do odpowiedniej kolekcji
  async addCollectionElement(data, collectionName, subCollection) {
    if (!data || !collectionName) {
      throw new Error('Data i nazwa Kolekcji jest wymagana');
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
      console.log('dodano do fire base:', data);
      return docRef.id;
    } catch (error) {
      console.error('błąd przy zapisie Elementow do Firestore:', error);
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
      throw new Error('Brak Elementów do Batchowania!');
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

        if (!fullData.id) throw new Error('Brak ID noda!');

        allData.push(fullData);
        batch.set(docRef, fullData);
      });

      await batch.commit();
      return allData;
    } catch (error) {
      console.error('Błąd przy zapisie w Batchu:', error);
    }
  }
  //metoda odczytująca elementy z danej kolekcji
  async getElementsfromSubCollection(roadmapID, collectionName, subCollection) {
    if (!collectionName || !subCollection) {
      throw new Error('Nazwa Kolekcji i pod kolekcji jest wymagana');
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

      console.log(`nody ${this.uid}: `, elements);
      return elements;
    } catch (error) {
      console.error('błąd przy odczycie  od firestore:', error);
      return [];
    }
  }

  //metoda do nadpisywania progrsu nodow

  async updateElements(
    roadmapID,
    collectionName,
    subCollection,
    nodeID,
    updateObj
  ) {
    if (!collectionName || !subCollection || !nodeID || !updateObj) {
      throw new Error(
        'Nazwa Kolekcji,pod kolekcji, id noda,oraz obiekt zdanymi są wymagane'
      );
    }
    try {
      const roadmapId = roadmapID.replace('ul-', '');
      const collectionRef = doc(
        db,
        `users/${this.uid}/${collectionName}/${roadmapId}/${subCollection}/${nodeID}`
      );
      const docQuery = await updateDoc(collectionRef, updateObj);
      console.log('obiekt ktory był:!', updateObj);
    } catch (err) {
      console.error('bład podczas updatu:', err);
    }
  }
  //metoda Kasująca element subkolekcji
  async deleteElement(docId, collectionName, subCollection, nodeID) {
    if (!docId || !collectionName || !subCollection || !nodeID) {
      throw new Error(
        'Brak odpowiednich danych do usuniecia elementu subkolekcji'
      );
    }
    try {
      const roadmapId = docId.replace('ul-', '');
      const docRef = doc(
        db,
        `users/${this.uid}/${collectionName}/${roadmapId}/${subCollection}/${nodeID}`
      );
      await deleteDoc(docRef);
      console.log(`Usunięto dokument ${nodeID} z podkolekcji ${subCollection}`);
      return true;
    } catch (error) {
      console.error('bład przy usuwaniu zadania:', error);
      return false;
    }
  }
  //metoda zapisu subkolekcji do firebase w czasie rzeczywistym
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
      throw new Error('Brak Danych do Sluchania w czasie rzeczywistym!');
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
              console.log('Dodano:', change.doc.data());
              callbacks.onAdd(change.doc.data());
            }
            if (change.type === 'modified') {
              console.log('Zmodyfikowano:', change.doc.data());
              callbacks.onModify(change.doc.data());
            }
            if (change.type === 'removed') {
              console.log('Usunieto:', change.doc.data());
              callbacks.onRemove(change.doc.data());
            }
          });
        },
        (onError) => {
          console.log('wykryto Bład!:', onError);
        }
      );
      return unsub;
    } catch (err) {
      console.error('bład podczas nasłuchu!', err);
    }
  }
  //metoda zapisu Elementu w czasie rzeczywistym
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
        'Nazwa Kolekcji,pod kolekcji, id noda,oraz obiekt zdanymi są wymagane'
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
            console.log('dane z snapshota:', snapshot.data());

            if (typeof callbacks.onUpdate === 'function') {
              callbacks.onUpdate(snapshot.data());
            }
          }
          if (snapshot.exists() === false) {
            console.log('brakdanych z snapshota,uruchomiono ondelete');

            if (typeof callbacks.onDelete === 'function') {
              callbacks.onDelete();
            }
          }
        },
        (onError) => {
          console.error('Błąd podczas nasluchu Elementu!', onError);
        }
      );
      return unsub;
    } catch (err) {
      console.error('bład try/catch podczas nasłuchu!', err);
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
        throw new Error(
          'nie udało sie przeniesc noda - zapis nie powiódł się.'
        );
      }
      const deletedDoc = await this.deleteElement(
        dataObj.roadmapID,
        refObj.collection,
        refObj.subCollection,
        dataObj.id
      );
      if (!deletedDoc) {
        throw new Error('Usuniecie orginalnego Noda nie powiodło się!');
      }

      if (newId && deletedDoc) {
        console.log('✅ ukonczono przenoszenie!');
        return true;
      }
    } catch (error) {
      console.error('❌błąd przy przenoszeniu Noda:', error);
      return false;
    }
  }
}

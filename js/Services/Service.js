import { collection, addDoc,getDocs,doc,deleteDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { db } from '../firebase-init.js';
import { serverTimestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";


export class FirestoreService {
    constructor(uid) {
        this.uid = uid;
    }

    // Metoda dodwania kolekcji do fire base
    async addCollection(data,collectionName) {
        if(!data || !collectionName) {
            throw new Error('data i nazwa Kolekcji jest wymagana');
        }
       console.log('typeof data.title:', typeof this.uid);
        console.log('data.title:', data.title);
        
        try {
            const ref = collection(db,`users/${this.uid}/${collectionName}`);
            const docRef = await addDoc(ref,{
                ...data,
                createdAt: serverTimestamp(),
            });
            return docRef.id;
            }
            catch (error) {
            console.error('błąd dodawania do firestore:', error)
            return null;
        }
    }
    //Metoda odczytu Kolekcji
    async loadUserCollection(collectionName) {
         if(!collectionName) {
            throw new Error('nazwa Kolekcji do odczytu danych jest wymagana');
        }
        try {
            const collectionRef = collection(db,`users/${this.uid}/${collectionName}`);
            const docQuery = await getDocs(collectionRef)
            const collections =[];
            docQuery.forEach((doc) => {
                collections.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            
            console.log(`kolekcje ${this.uid}:`, collections);
            return collections;
        } catch (error) {
            console.error ('błąd przy odczycie  od firestore:', error);
            return [];
        }
    }
     //metoda Kasująca kolekcje
    async deleteDocument(docId,collectionName){
        if(!docId || !collectionName) {
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
     async addCollectionElement (data, collectionName,subCollection) {
        if(!data || !collectionName) {
            throw new Error('Data i nazwa Kolekcji jest wymagana');
        }

          try {
            const roadmapID = data.roadmapID.replace('ul-','');
            const collectionRef = collection(db,`users/${this.uid}/${collectionName}/${roadmapID}/${subCollection}`);
            const docRef = await addDoc(collectionRef, {
                ...data,
                createdAt: serverTimestamp()
                  });
                  console.log("dodano do fire base:",data)
              return docRef.id;
          } catch (error) {
              console.error('błąd przy zapisie Elementow do Firestore:',error);
              return null;
          }
      }
      //metoda odczytująca elementy z danej kolekcji
      async getElementsfromSubCollection(roadmapID,collectionName, subCollection) {
         if(!collectionName || !subCollection) {
            throw new Error('Nazwa Kolekcji i pod kolekcji jest wymagana');
        }
        try {
            const roadmapId = roadmapID.replace('ul-','');
            const collectionRef = collection(db,`users/${this.uid}/${collectionName}/${roadmapId}/${subCollection}`);
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
            console.error ('błąd przy odczycie  od firestore:', error);
            return [];
        }
      }
  
    
 
}
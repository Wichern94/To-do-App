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
            throw new Error("data i nazwa Kolekcji jest wymagana");
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
            throw new Error("nazwa Kolekcji do odczytu danych jest wymagana");
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
            throw new Error("ID i nazwa Kolekcji jest wymagana");
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
   
    

    // static async AddUserDoc (data) {
    //       try {
    //           const userTaskRef = collection(db,`users/${data.uid}/Roudmaps`);
    //           const docRef = await addDoc(userTaskRef, {
    //               ...data,
    //               createdAt: serverTimestamp()
    //               });
    //           return docRef.id;
    //       } catch (error) {
    //           console.error('błąd przy zapisie do Firestore:',error);
    //           return null;
    //       }
    //   }
  
    
 
}
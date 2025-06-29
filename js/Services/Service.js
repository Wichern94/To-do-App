import { collection, addDoc,getDocs,doc,deleteDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { db } from '../firebase-init.js';
import { serverTimestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";


export class FirestoreService {
    constructor(uid) {
        this.uid = uid;
    }
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
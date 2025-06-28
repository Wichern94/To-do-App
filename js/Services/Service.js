import { collection, addDoc,getDocs,doc,deleteDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { db } from './firebase-init.js';
import { serverTimestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";


export class FirestoreService {
    static async AddUserDoc (data) {
          try {
              const userTaskRef = collection(db,`users/${data.uid}/Roudmaps`);
              const docRef = await addDoc(userTaskRef, {
                  ...data,
                  createdAt: serverTimestamp()
                  });
              return docRef.id;
          } catch (error) {
              console.error('błąd przy zapisie do Firestore:',error);
              return null;
          }
      }
  
    
 
}
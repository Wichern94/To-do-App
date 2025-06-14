// Importuje baze danych oraz obsluge z firebase
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
 
  // konfiugracja
  const firebaseConfig = {
    apiKey: "AIzaSyC76sRkTqpvvUQ8odZtdUZv_UJQGAO6yTE",
    authDomain: "pwr-tsk.firebaseapp.com",
    projectId: "pwr-tsk",
    storageBucket: "pwr-tsk.appspot.com",
    messagingSenderId: "938981123104",
    appId: "1:938981123104:web:823010e550cefdb9a24845"
  };
  

  // inicjalizuje firebase
  export const fireApp = initializeApp(firebaseConfig);
  export const db = getFirestore(fireApp);
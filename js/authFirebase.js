import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { fireApp } from './firebase-init.js';  //  plik z inicjalizacją Firebase

const auth =  getAuth(fireApp);
// klasa  obslugi firebase
export class AuthService { //klasa do exportu
    constructor(authInstance ){ //konstruktor w ktorym podamy const auth gdy bedziemy powolywac instacje
        this.auth = authInstance; //auth
        
    }
    //metoda rejestracji uzytkownika
   async  registerUser (email,password) { //e mail i haslo jako argumenty
    try {
       const registerData = await createUserWithEmailAndPassword(this.auth, email ,password); // metoda od fire base
       const user = registerData.user; //zarejsetrowany uzytkownik ktorgo potem zwracamy
       console.log('zarejestrowano użytkownika',user.email, user.uid); //pokazujemy kogo iczy sie udalo
       return user; //zwracamy uzytkownika zeby wykorzystac to w ui
    } catch (error) {
        //obsługa błedu
        console.error('błąd rejestracji:', error.code, error.message);
        throw error
    }
}
//metoda Logowania uzytkownika
async loginUser( email,password) {
    try {
        const logindData = await signInWithEmailAndPassword(this.auth, email,password);
        const user = logindData.user;
        console.log('zalogowano użytkownika', user.email, user.uid);
        return user;
    } catch (error) {
        console.error('błąd rejestracji:', error.code,error.message);
        throw error
    }
        
}
//metoda Resetowania Hasła
async resetPassword(email) {
    try {
        const resetPswrd = await sendPasswordResetEmail(this.auth, email);
        console.log('wysłano maila na:', email);
        return {succes:true, email } 
        
    } catch (error) {
        
        console.error('Błąd zapytania:', error.code,error.message);
        throw error
        
        }
    }
}
        

       

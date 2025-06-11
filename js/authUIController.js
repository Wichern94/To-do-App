import{ LoginFormHandler } from './formHandlers.js' ;
import { FormErrors } from './uiErrorHandler.js';
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { fireApp } from './firebase-init.js';


export class AuthUIController {
    constructor (viewManager) {
        this.viewManager = viewManager;
        this.LoginErrorHandler = new FormErrors('lgn-from');
        this.regErrorHandler = new FormErrors('register-form');
        this.forgetErrorHandler = new FormErrors('forget-form');
        this.bindScreenEvents();
        this.getActiveView();
    }
    
    //Metoda obsługi zmiany widoków
    bindScreenEvents() {
    // Pobieram przyciski zmiany widokow:
    const logBackBtns = document.querySelectorAll('.log-back-btn'); //<- wraca do logowania
    const forgetBtn = document.querySelector('.forget-link'); //<- idzie do sekcji odzyskaj haslo
    const regstrBtn = document.querySelector('.register-link'); //<- idzie do sekcji rejestracji
    
    // dodaje nasłuchiwanie na przycisk "zapomniałes Hasło"
    forgetBtn.addEventListener('click', (e) => this.showFrgt(e));

    // dodaje Nasłuchiwanie na przycisk Rejsetracji
    regstrBtn.addEventListener('click', (e) => this.showRgstr(e));

    //dodaje nasluchiwanie na przycisk poworotu do logowania
    logBackBtns.forEach(btns => 
        btns.addEventListener('click',(e) => this.showLogIn(e)));
    };
    // Metoda pokazujaca forget
    showFrgt(e) {
        e.preventDefault();
        console.log('kliknieto w forget');
        this.viewManager.showView('forget-screen');
    }
    // Metoda pokazująca  rejstracje 
    showRgstr(e){
        e.preventDefault();
        console.log('kliknieto w register');
        this.viewManager.showView('register-screen');
    }
    // Metoda powrotu do Logowania
    showLogIn(e) {
        e.preventDefault();
        this.viewManager.hideOneView('forget-screen');
        console.log('kliknieto w logback');
        this.viewManager.showView('login-screen');
    }
    //metoda do zmiany widoku po wylogowaniu sie
    logout() {
        console.log('wylogowano');
        
        this.viewManager.hideOneView('todo-screen')
        this.viewManager.showView('login-screen');
        
    }
    //sprawdzamy i okreslamy aktualny widok
    getActiveView() {
        if (document.getElementById('login-screen')?.offsetParent !== null) {
            return 'login';
        }
        if (document.getElementById('register-screen')?.offsetParent !== null) {
            return 'register';
        }
        if (document.getElementById('forget-screen')?.offsetParent !== null) {
            return 'reset';
        }
        if (document.getElementById('todo-screen')?.offsetParent !== null) {
            return 'apk';
         }   
        return null;
    
    }
}
    
        
        
        
        
        


    






      
                
       
       

        

        
    

        

        
        
   
        
        
        
 

    
        

        
       
    
        

   







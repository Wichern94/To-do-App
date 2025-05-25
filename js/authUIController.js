import{ LoginFormHandler } from './login.js' ;
import { FormErrors } from './uiErrorHandler.js';
import { AuthService} from './authFirebase.js'
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { fireApp } from './firebase-init.js';

export class AuthUIController {
    constructor (viewManager) {
        this.viewManager = viewManager;
        this.handler = new LoginFormHandler('lgn-from');
        this.LoginErrorHandler = new FormErrors('lgn-from')
        this.bindScreenEvents();
        
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
                console.log("kliknieto w forget");
                this.viewManager.showView('forget-screen');
            }
            // Metoda pokazująca  rejstracje 
            showRgstr(e){
                e.preventDefault();
                console.log("kliknieto w register");
                this.viewManager.showView('register-screen');
            }
            // Metoda powrotu do Logowania
            showLogIn(e) {
                e.preventDefault();
                console.log("kliknieto w logback");
                this.viewManager.showView('login-screen');
            }
            //Metoda Logowania Użytkownika
            logInApp(values){
                this.LoginErrorHandler.clearAllErrors()
                console.log('wartosci z inputów:', values);
                if(this.loginErrors(values)) return
                this.viewManager.showView('todo-screen') 
            }
            
        }   
                
       
       

        

        
    

        

        
        
   
        
        
        
 

    
        

        
       
    
        

   







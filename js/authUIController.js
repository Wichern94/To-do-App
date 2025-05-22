import{ LoginFormHandler } from './login.js' ;
import { FormErrors } from './uiErrorHandler.js';

export class AuthUIController {
    constructor (viewManager) {
        this.viewManager = viewManager;
        this.handler = new LoginFormHandler('lgn-from');
        this.LoginErrorHandler = new FormErrors('lgn-from')
        this.bindEvents();
        this.setupErrorClearing()
        
    }

    bindEvents() {
        // Pobieram Resjestracje, odzyskiwanie Hasła,Logowanie, formularz
        const logBackBtns = document.querySelectorAll('.log-back-btn');
        const forgetBtn = document.querySelector('.forget-link');
        const regstrBtn = document.querySelector('.register-link');
        const logInBtn = document.querySelector('.login-btn');
        
       
        // dodaje nasłuchiwanie na przycisk "zapomniałes Hasło"
        forgetBtn.addEventListener('click', (e) => this.showFrgt(e));

        // dodaje Nasłuchiwanie na przycisk Rejsetracji
        regstrBtn.addEventListener('click', (e) => this.showRgstr(e));

        //dodaje nasluchiwanie na przycisk poworotu do logowania
        logBackBtns.forEach(btns => 
            btns.addEventListener('click',(e) => this.showLogIn(e)));
        
        // dodaje nasłuchiwanie na przycisk logowania
        this.handler.onSubmit((values) => this.logInApp(values));

        

        
    
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
    // Metoda Błędów logowania
    loginErrors(values) {
        let hasError = false;
        if(values.email === '') {
           this.LoginErrorHandler.showError('email','Uzupełnij pola!'); 
           hasError = true;
        }
        if (values.password ==='') {
            this.LoginErrorHandler.showError('password','Uzupełnij pola!');
            hasError = true;
        }
        return hasError
    }
    // kasowanie błedów
    setupErrorClearing() {
        const inputs = this.handler.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                this.LoginErrorHandler.clearError(input.name)
            }) 
        })
    }
}   
        

        

        
        
   
        
        
        
 

    
        

        
       
    
        

   







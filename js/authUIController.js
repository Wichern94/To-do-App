import{ LoginFormHandler } from './login.js'

export class AuthUIController {
    constructor (viewManager) {
        this.viewManager = viewManager;
        this.bindEvents();
        this.handler = new LoginFormHandler('lgn-from');
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
        logInBtn.addEventListener('click', (e) => this.logInApp(e));

        

        
    
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
    logInApp(){
        this.handler.onSubmit((values)=> {
            console.log('wartosci z inputów:', values);
            
        })
    }
    
        
}
        
       
    
        

   







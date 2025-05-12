export class AuthUIController {
    constructor (viewManager) {
        this.viewManager = viewManager;
        this.bindEvents();
    }

    bindEvents() {
        // Pobieram Resjestracje, odzyskiwanie Hasła,Logowanie 
        const logBackBtns = document.querySelectorAll('.log-back-btn');
        const forgetBtn = document.querySelector('.forget-link');
        const regstrBtn = document.querySelector('.register-link');
       
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
}





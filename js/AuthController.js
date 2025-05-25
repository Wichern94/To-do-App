import{ LoginFormHandler } from './login.js' ;
import { FormErrors } from './uiErrorHandler.js';
import { AuthService} from './authFirebase.js'
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { fireApp } from './firebase-init.js';

export class AuthController{
    constructor(viewManger,uiController) {
        this.viewManger = viewManger;
        this.ui = uiController;
        this.formErrors = new FormErrors('lgn-form');
        this.authService = new AuthService(getAuth(fireApp));
    }
    init() {
        document.addEventListener('auth:login', e => this.handleLogin(e.detail));
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
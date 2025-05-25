import{ LoginFormHandler } from './login.js' ;
import { FormErrors } from './uiErrorHandler.js';
import { AuthService} from './authFirebase.js'
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { fireApp } from './firebase-init.js';

export class AuthController{
    constructor(viewManger,authService,authUI) {
        this.viewManger = viewManger;
        this.authService =authService;
        this.authUI = authUI;
        this.init();
        
        
    }
        
        
        
    
    init() {
        document.addEventListener('auth:login', e => this.handleLogin(e.detail));
        this.regListener = document.addEventListener('auth:register', e =>
            this.handleRegister(e.detail))
    }

   async handleRegister(values) {
        try{
            const {email, password } = values;
            const user = await this.authService.registerUser(email,password);
            console.log('Zarejestrowano:', user);
            //po rejestracji przechodzimy do login screena
            this.viewManger.showView('login-screen');
            alert('Rejestracja udana. Możesz sie teraz zalogować.')
            
        } catch (err) {
            console.error('błąd rejestracji:', err.code);

            //obsługa błedów w firebase
            if(err.code === 'auth/email-already-in-use') {
                this.authUI.regErrorHandler.showError('email-reg','Ten email jest zajęty')
            } else if (err.code === 'auth/weak-password') {
                this.authUI.regErrorHandler.showError('password-reg', 'Hasło jest za słabe')
            } else {
                alert ('Nie udało sie zarejestrowac. Spróbuj ponownie');
            }
        }
        
    }


//   // Metoda Błędów logowania
//     loginErrors(values) {
//         let hasError = false;
//         if(values.email === '') {
//            this.LoginErrorHandler.showError('email','Uzupełnij pola!'); 
//            hasError = true;
//         }
//         if (values.password ==='') {
//             this.LoginErrorHandler.showError('password','Uzupełnij pola!');
//             hasError = true;
//         }
//         return hasError
//     }
//     // kasowanie błedów
//     setupErrorClearing() {
//         const inputs = this.handler.form.querySelectorAll('input');
//         inputs.forEach(input => {
//             input.addEventListener('focus', () => {
//                 this.LoginErrorHandler.clearError(input.name)
//             }) 
//         })
//     }
}   
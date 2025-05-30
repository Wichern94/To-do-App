import{ LoginFormHandler } from './formHandlers.js' ;
import { FormErrors } from './uiErrorHandler.js';
import { AuthService} from './authFirebase.js'
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { fireApp } from './firebase-init.js';
import {LogoutButtonHandler} from './todo.js'

export class AuthController{
    constructor(viewManger,authService,authUI) {
        this.viewManger = viewManger;
        this.authService =authService;
        this.authUI = authUI;
        
        this.init();
        
        //inicjalizacja eventów formularzy
    }
    init() {
        document.addEventListener('auth:login', e => 
            this.handleLogin(e.detail));

        document.addEventListener('auth:register', e =>
            this.handleRegister(e.detail));

        document.addEventListener('auth:reset-password', e => 
            this.handlePswrdReset(e.detail))
        
        document.addEventListener('auth:logout', e => 
            this.handleLogout());
        
    }
      //metoda odbierajaca event rejestracji uzytkownika  
        
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
     //Metoda odbierajaca event Logowania
    async handleLogin(values) {
        try {
            const {email,password } = values;
            const user = await this.authService.loginUser(email,password);
            console.log('zalogowano:', user);
            this.viewManger.showView('todo-screen');
            
            alert('ZALOGOWANO!')
        } catch (err) {
            switch(err.code) {
                case 'auth/user-not-found':
                    this.authUI.LoginErrorHandler.showError('email','Nie znaleziono użytkownika');
                    break;
                case 'auth/wrong-password':
                    this.authUI.LoginErrorHandler.showError('password','Złe hasło!');
                    break;
                case 'auth/invalid-email':
                    this.authUI.LoginErrorHandler.showError('email','Nieprawidłowy Format email');
                    break;
                case 'auth/user-disabled':
                    this.authUI.LoginErrorHandler.showError('email','Konto wyłączone!');
                    break;
                case 'auth/too-many-requests':
                    this.authUI.LoginErrorHandler.showError('email','za duzo prób logowania');
                    break;
                    default:
                    console.error('błąd logowania:', err.code);
            }
        }
    }
    //Metoda odbierajace event resetu hasła
    async handlePswrdReset({email}) {
        try {
            const resetPswrd = await this.authService.resetPassword(email);
            alert('wysłano maila ', email);
            
        } catch (err) {
            switch(err.code) {
                case 'auth/user-not-found':
                    this.authUI.forgetErrorHandler.showError('useremail','Nie znaleziono użytkownika');
                    break;
                case 'auth/invalid-email':
                    this.authUI.forgetErrorHandler.showError('useremail','Nieprawidłowy format');
                    break;
                case 'auth/too-many-requests':
                    this.authUI.forgetErrorHandler.showError('useremail','Zbyt wiele prób');
                    break;
                    default:
                    console.error('błąd logowania:', err.code);
            }
        }
    }
    async handleLogout(){
        try {
            await this.authService.logOut()
            alert('Wylogowano!')
            this.authUI.logout();
        } catch (error) {
            console.error('błąd wylogowania', error.code, error.message);
        }
    }
}
            
            
            
            
                

        
    




   
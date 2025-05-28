import { FormErrors } from './uiErrorHandler.js';

export class ResetFormHandler  {
    constructor (authUI,formID,formEmail,) {
        this.authUI = authUI;
        this.credentialsForm = document.getElementById(formID);
        this.formErrors = new FormErrors(formID);
        this.emailInput = this.credentialsForm.querySelector(
            `input[name="${formEmail}"]`);
        this.setupErrorClearing()
        this.#setupForgetFormListener()
        
    }
    #setupForgetFormListener() {
        this.credentialsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.formErrors.clearAllErrors(); //<- czyszcze błedy

        const email = this.emailInput.value.trim();
        let hasError = false;
            if (!email ) {
                this.formErrors.showError('useremail', 'Podaj email!');
                hasError =true;
            } if (!this.isValidEmail(email)) {
                this.formErrors.showError('useremail', ' Niepoprawny email!');
                hasError =true;
            } if(!hasError) {
                document.dispatchEvent(new CustomEvent('auth:reset-password',{detail: {email}}));
            }
        })
    }
//metoda pomocnicza do sprawdzenia emaila
isValidEmail(email) {
const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return regex.test(email);
    }
// kasowanie błedów
setupErrorClearing() {
    this.emailInput.addEventListener('focus', () => {
        this.formErrors.clearError(formEmail);
        });
    }
}
    















//Klasa obsługi Logowania
export class LoginFormHandler {
    constructor(authUI,formID,formEmail,formPass) { //authUI <- AuthUIControler, formID <- podajemy id własciwego formularza
        this.authUI = authUI;
        this.credentialsForm = document.getElementById(formID);
        this.emailInput = this.credentialsForm.querySelector(
            `input[name="${formEmail}"]`);

        this.passwordInput = this.credentialsForm.querySelector(
            `input[name="${formPass}"]`);
        
        this.setupFormListeners()

        this.setupErrorClearing()
    }
  


//logika logowania
 setupFormListeners() {
     this.credentialsForm.addEventListener('submit',(e) => { 
         e.preventDefault(); //zapobiegam przeładowaniu strony
         this.authUI.LoginErrorHandler.clearAllErrors(); //<-najpierw usuwamy błedy
         const email = this.emailInput.value.trim();
         const password = this.passwordInput.value.trim();
         let hasError = false;
      if(email === '') {
         this.authUI.LoginErrorHandler.showError('email','Uzupełnij pola!'); 
        hasError = true;
     }
      if (password === '') {
         this.authUI.LoginErrorHandler.showError('password','Uzupełnij pola!');
          hasError = true;
     } if(!hasError) 
         {
             const values = { email, password }; // przekazuje e mail i haslo do nowego eventu
             document.dispatchEvent(new CustomEvent('auth:login', { detail: values }));
        }
    });
}
// kasowanie błedów
setupErrorClearing() {
    this.emailInput.addEventListener('focus', () => {
        this.authUI.LoginErrorHandler.clearError('email');
    });
    this.passwordInput.addEventListener('focus', () => {
        this.authUI.LoginErrorHandler.clearError('password');
        }); 
    }
}
//klasa obsługi Rejestracji
export class RegisterFormHandler extends LoginFormHandler {
constructor(authUI,formID,formEmail,formPass,formConfirmPass) {
    super(authUI,formID,formEmail,formPass);
    this.confirmPasswordInput = this.credentialsForm.querySelector(
        `input[name="${formConfirmPass}"]`);
    this.setupRegisterFormListener();
}
//metoda wysylki rejstracji
setupRegisterFormListener() {
    this.credentialsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.authUI.regErrorHandler.clearAllErrors(); //<- czyszcze błedy
    
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value.trim();
        const confirmPassword = this.confirmPasswordInput.value.trim();
        let hasError = false;
   
        if(password && confirmPassword && password !== confirmPassword) {
            this.authUI.regErrorHandler.showError('confirm-password', 'Hasła nie sa Takie same!');
            hasError = true;

        } if (!email ) {
            this.authUI.regErrorHandler.showError('email-reg', 'Podaj email!');
            hasError =true;

        } if (!password) {
            this.authUI.regErrorHandler.showError('password-reg', 'podaj hasło!');
            hasError = true

        } else if (password.length < 6) {
             this.authUI.regErrorHandler.showError('password-reg', 'hasło jest za krotkie');
             hasError = true;

        } if (!this.isValidEmail(email)) {
            this.authUI.regErrorHandler.showError('email-reg', ' Niepoprawny email!');
            hasError =true;

        }  if (!hasError) {
            
        const values = {email, password };
        document.dispatchEvent(new CustomEvent('auth:register',{detail: values}));
                }
            }   
        )  
    }
}


export class ResetFormHandler  {
    constructor (authUI,formID,formEmail) {
        
    }
    setupForgetFormListener() {
        this.credentialsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.authUI.forgetErrorHandler.clearAllErrors(); //<- czyszcze błedy

        const email = this.emailInput.value.trim();
        let hasError = false;
            if (!email ) {
                this.authUI.forgetErrorHandler.showError('useremail', 'Podaj email!');
                hasError =true;
            } if (!this.isValidEmail(email)) {
                this.authUI.forgetErrorHandler.showError('useremail', ' Niepoprawny email!');
                hasError =true;
            } if(!hasError) {
                document.dispatchEvent(new CustomEvent('auth:reset-password',{detail: {email}}));
            }
        })
    }
}

        


     
        
        
    

                    
            
    
   
        

    
import { FormErrors } from './uiErrorHandler.js';

export class ResetFormHandler  {
    constructor (authUI,formID,formEmail) {
        this.authUI = authUI;
        this.credentialsForm = document.getElementById(formID);
        this.formErrors = new FormErrors(formID);
        this.formEmailName = formEmail;
        this.emailInput = this.credentialsForm.querySelector(
            `input[name="${formEmail}"]`);
       
        

        this.setupResetErrorClearing();
        
        
    }
    init(){
         this.handleSubmit = this.setupForgetForm.bind(this);
        this.credentialsForm.addEventListener('submit', this.handleSubmit);
    }
    setupForgetForm(e) {
        
        e.preventDefault();
        this.formErrors.clearAllErrors(); //<- czyszcze błedy

        const email = this.emailInput.value.trim();
        let hasError = false;
            if (!email ) {
                this.formErrors.showError('useremail', 'Podaj email!');
                hasError =true;
            } else if (!this.isValidEmail(email)) {
                this.formErrors.showError('useremail', ' Niepoprawny email!');
                hasError =true;
            } if(!hasError) {
                document.dispatchEvent(new CustomEvent('auth:reset-password',{detail: {email}}));
            }
        
    }
    destroy() {
        console.log('zniszczono ResetFormHandler');
        
        this.credentialsForm.removeEventListener('submit',this.handleSubmit);
        console.log('usunieto event z:', this.credentialsForm);
        
    }
//metoda pomocnicza do sprawdzenia emaila
isValidEmail(email) {
const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return regex.test(email);
    }
// kasowanie błedów
setupErrorClearing() {
    this.emailInput.addEventListener('focus', () => {
        this.formErrors.clearError(this.formEmailName);
        });
    }
    setupResetErrorClearing() {
    this.emailInput.addEventListener('focus', () => {
        this.formErrors.clearError(this.formEmailName);
        });
    }
}
    

//Klasa obsługi Logowania
export class LoginFormHandler extends ResetFormHandler {
    constructor(authUI,formID,formEmail,formPass) { //authUI <- AuthUIControler, formID <- podajemy id własciwego formularza
        super(authUI,formID,formEmail)
        this.formPassName = formPass;
        this.passwordInput = this.credentialsForm.querySelector(
        `input[name="${formPass}"]`);
        this.handleSubmit = this.setupFormLogin.bind(this);
        this.credentialsForm.addEventListener('submit', this.handleSubmit);
        
        this.setupErrorClearing()
    }
    //logika logowania
     setupFormLogin(e) {
         
             e.preventDefault(); //zapobiegam przeładowaniu strony
             this.formErrors.clearAllErrors(); //<-najpierw usuwamy błedy
             const email = this.emailInput.value.trim();
             const password = this.passwordInput.value.trim();
             let hasError = false;
          if(email === '') {
             this.formErrors.showError('email','Uzupełnij pola!'); 
            hasError = true;
         }
          if (password === '') {
             this.formErrors.showError('password','Uzupełnij pola!');
              hasError = true;
         } if(!hasError) 
             {
                 const values = { email, password }; // przekazuje e mail i haslo do nowego eventu
                 document.dispatchEvent(new CustomEvent('auth:login', { detail: values }));
            }
        };
    destroy() {
    console.log('Znieszczono LoginFormHandler');
        
    this.credentialsForm.removeEventListener('submit', this.handleSubmit);
    super.destroy(); 
    }
    
    // kasowanie błedów
    setupErrorClearing() {
        
        super.setupErrorClearing();
        this.passwordInput.addEventListener('focus', () => {
            this.formErrors.clearError(this.formPassName);
            }); 
        }
    }

    //klasa obsługi Rejestracji
    export class RegisterFormHandler extends ResetFormHandler {
    constructor(authUI,formID,formEmail,formPass,formConfirmPass) {
        super(authUI,formID,formEmail);
        this.confirmPasswordInput = this.credentialsForm.querySelector(
            `input[name="${formConfirmPass}"]`);
    
        this.formPassName = formPass;
        this.confirmPswrd = formConfirmPass;
        this.passwordInput = this.credentialsForm.querySelector(
            `input[name="${formPass}"]`);
        this.handleSubmit = this.setupRegisterForm.bind(this);
        this.credentialsForm.addEventListener('submit', this.handleSubmit);
    
        
        this.setupErrorClearing()
    }

    //metoda wysylki rejstracji
    setupRegisterForm(e) {
        
            e.preventDefault();
            this.formErrors.clearAllErrors(); //<- czyszcze błedy
        
            const email = this.emailInput.value.trim();
            const password = this.passwordInput.value.trim();
            const confirmPassword = this.confirmPasswordInput.value.trim();
            let hasError = false;
       
            if(password && confirmPassword && password !== confirmPassword) {
                this.formErrors.showError('confirm-password', 'Hasła nie sa Takie same!');
                hasError = true;
    
            } if (!email ) {
                this.formErrors.showError('email-reg', 'Podaj email!');
                hasError =true;
    
            } if (!password) {
                this.formErrors.showError('password-reg', 'podaj hasło!');
                hasError = true
    
            } else if (password.length < 6) {
                 this.formErrors.showError('password-reg', 'hasło jest za krotkie');
                 hasError = true;
    
            } if (!this.isValidEmail(email)) {
                this.formErrors.showError('email-reg', ' Niepoprawny email!');
                hasError =true;
    
            }  if (!hasError) {
                
            const values = {email, password };
            document.dispatchEvent(new CustomEvent('auth:register',{detail: values}));
                    }
                } 
            
        destroy() {
        console.log('Zniszczono RegisterFormHandler');
            
        this.credentialsForm.removeEventListener('submit', this.handleSubmit);
        super.destroy(); 
        }  
             
        
        // kasowanie błedów
        setupErrorClearing() {
            
            super.setupErrorClearing();
            this.passwordInput.addEventListener('focus', () => {
                this.formErrors.clearError(this.formPassName);
                });
            this.confirmPasswordInput.addEventListener('focus', () => {
            this.formErrors.clearError(this.confirmPswrd);
                }); 
            }
    }












        
        

        

        
  






        


     
        
        
    

                    
            
    
   
        

    
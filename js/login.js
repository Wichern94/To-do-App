export class LoginFormHandler {
    constructor(authUI) { //jako argument selektor of formualrza
        this.authUI = authUI;
        this.logForm = document.getElementById('lgn-from');
        this.emailInput = this.logForm.querySelector('input[name="email"]')
        this.passwordInput = this.logForm.querySelector('input[name="password"]')
        
        this.setupFormListeners()

        this.setupErrorClearing()
    }
  


 setupFormListeners() {
        console.log('auth ui controler',  this.authUI.LoginErrorHandler);
        
        this.logForm.addEventListener('submit',(e) => { 
            e.preventDefault();
            this.authUI.LoginErrorHandler.clearAllErrors();
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
                const values = { email, password };
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
               
                    
            
    
    
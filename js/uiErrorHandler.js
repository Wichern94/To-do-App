export class FormErrors {
    constructor (formSelector){
        this.form = document.getElementById(formSelector); // łapie formularz
        this.inputs = this.form.querySelectorAll('input');  // łapie input z tego formularza
        this.errorElement = this.form.querySelectorAll('.err-message'); //łapie paragrafy z błedami
        
    }
       
    //  Metoda pokazujaca bład
    showError(rightInput,errMessage) {
        const targetError = Array.from(this.errorElement).find( //robie tablice z node listy querySelectorAll('.err-msg');
            el => el.dataset.for === rightInput //znajduje paragraf nalezacy  do inputa
        );
        const inputElement = this.form.querySelector(`[name='${rightInput}']`); //znajduje input po name

        if(targetError){ //jesli jest
            console.log( 'paragraf znaleziony:', targetError);
            
            targetError.textContent = errMessage; // podaje treść wiadomosci
            targetError.classList.remove('hidden'); //pokazuje usuwajac klase hidden
        }
        
        if(inputElement.tagName ==='INPUT') {
            inputElement.classList.add('input-error'); //dodaje klase z czerwonym borderem
        }else if (inputElement.tagName ==='TEXTAREA'){
            
            inputElement.classList.add('error-border');
            
        }
    }  
     //  Metoda pokazujaca zielony pozytywny
    showPossitive(rightInput,errMessage) {
        
        const targetError = Array.from(this.errorElement).find( //robie tablice z node listy querySelectorAll('.err-msg');
            el => el.dataset.for === rightInput //znajduje paragraf nalezacy  do inputa
        );
        const inputElement = this.form.querySelector(`[name='${rightInput}']`); //znajduje input po name

        if(targetError){ //jesli jest
            
            
            targetError.textContent = errMessage; // podaje treść wiadomosci
            targetError.classList.remove('hidden'); //pokazuje usuwajac klase hidden
            targetError.classList.add('greenTxt');
        }
        
        if(inputElement) {
            inputElement.classList.add('input-possitive'); //dodaje klase z zielonym borderem
        }
    }  
           
    // Metoda usuwajacy błąd
    clearError(rightInput) {
       const inputElement = this.form.querySelector(`[name='${rightInput}']`);
       if(!inputElement){
        console.warn(`Element o nazwie:${rightInput} nie został znaleziony!`)
       }
       const targetError = Array.from(this.errorElement).find(
            el => el.dataset.for === rightInput
       );
       if(targetError) {
            targetError.textContent = '';
            targetError.classList.add('hidden');
            targetError.classList.remove('greenTxt');
            
            
            }
        if(inputElement.tagName === 'INPUT') {
            inputElement.classList.remove('input-error');
            inputElement.classList.remove('input-possitive');
        }  
         else if (inputElement.tagName ==='TEXTAREA') {
            console.log('element do usuwania bledu to :',inputElement);
            
            inputElement.classList.remove('error-border');
        }
            
            
    }
    clearAllErrors() {
         this.errorElement.forEach( err => {
            err.textContent = '';
            err.classList.add('hidden');
            err.classList.remove('greenTxt')
            
            
         }
        ) 
         this.inputs.forEach(inpt => {
            inpt.classList.remove('input-error');
            inpt.classList.remove('input-possitive');

            
            }
        );
    }
}

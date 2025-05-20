export class FormErrors {
    constructor (formSelector){
        this.form = document.getElementById(formSelector);
        this.inputs = this.form.querySelectorAll('input');
        this.errorContainer = this.form.querySelectorAll('.err-msg')
    }
    showError(rightInput,errMessage) {
        const errorElement = this.form.querySelector(
            `.err-msg[data-for='${rightInput}']`);
            if(errorElement){
                errorElement.textContent = errMessage;
                errorElement.style.display = 'block';
            }
            const inputElement = this.form.querySelector(`[name='${rightInput}']`);
            if(inputElement) {
                inputElement.style.borderBottom = '.5px solid var(--btn-danger)'
            }
               
            
      }  
    clearError(rightInput){
        const deleteErr = this.showError.prgphs
    }
}
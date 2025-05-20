export class LoginFormHandler {
    constructor(formSelector) { //jako argument selektor of forumalrza
        this.form = document.getElementById(formSelector);
        this.inputs = this.form.querySelectorAll('input'); // pobeiramy inputy z forumlarza
    }
    getInputValues() {
        const values = {};
        this.inputs.forEach(input => { //przchodze przez imputy
        values[input.name || input.id] = input.value;
        });
        return values;
    }
        //nasłuchiwanie na  submit
    onSubmit(callback) {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            callback(this.getInputValues());
        });
    }
}
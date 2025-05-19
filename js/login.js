export class LoginFormHandler {
    constructor(formSelector) {
        this.form = document.getElementById(formSelector);
        this.inputs = this.form.querySelectorAll('input');
    }
    getInputValues() {
        const values = {};
        this.inputs.forEach(input => {
        values[input.name || input.id] = input.value;
        });
        return values;
    }

    onSubmit(callback) {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            callback(this.getInputValues());
        });
    }
}
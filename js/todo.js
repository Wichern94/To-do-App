export class LogoutButtonHandler {
    constructor(buttonID) {
        this.button = document.getElementById(buttonID)
        this.setLogoutListener();
        
    }
    setLogoutListener(){
        if(this.button) {
            this.button.addEventListener('click', (e) => {
                e.preventDefault();
                document.dispatchEvent(new CustomEvent ('auth:logout'));
            })
        }
    }
}
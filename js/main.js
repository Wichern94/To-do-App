            // importy:
//firebase
import { fireApp } from './firebase-init.js';
import {AuthService} from './authFirebase.js'
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
// viewManager
import { ViewManager } from './viewManager.js';
// AuthControler
import {AuthController} from './AuthController.js'
import { AuthUIController } from './authUIController.js';
// Powołuje Instacje klass
class App {
    constructor() {
        this.viewManager = new ViewManager();
        this.authUi = new AuthUIController(this.viewManager); 
        this.authService = new AuthService(getAuth(fireApp))
        this.authController = new AuthController(this.viewManager,this.authService,this.authUi)
    }
}
const app = new App()
// const viewManager = new ViewManager();
// const authUi = new AuthUIController(viewManager)

    





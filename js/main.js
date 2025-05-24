            // importy:
//firebase
import { fireApp } from './firebase-init.js';
// viewManager
import { ViewManager } from './viewManager.js';
// AuthControler
import { AuthUIController } from './authUIController.js';
// Powołuje Instacje klass
class App {
    constructor() {
        this.viewManager = new ViewManager();
        this.authUi = new AuthUIController(this.viewManager); 
    }
}
const App = new App()
// const viewManager = new ViewManager();
// const authUi = new AuthUIController(viewManager)

    





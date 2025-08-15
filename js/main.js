// importy:
//firebase
import { fireApp } from "./firebase-init.js";
import { AuthService } from "./authFirebase.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
// viewManager
import { ViewManager } from "./viewManager.js";
// AuthControler
import { AuthController } from "./AuthController.js";
import { AuthUIController } from "./authUIController.js";
//logowanie/ rejestracja/forget
import { LoginFormHandler } from "./formHandlers.js";
import { RegisterFormHandler } from "./formHandlers.js";
import { ResetFormHandler } from "./formHandlers.js";
// przycisk wylogowania sie

// Widokaplikacji
import { TodoApp } from "./todo.js";
// Powołuje Instacje klass
class App {
  constructor() {
    this.viewManager = new ViewManager();
    this.authUi = new AuthUIController(this.viewManager);
    this.authService = new AuthService(getAuth(fireApp));
    this.authController = new AuthController(
      this.viewManager,
      this.authService,
      this.authUi
    );
    this.activeHandler = null;
    this.cleanUpInactiveViews();
    this.initializeForm();
    this.formChecker();
  }
  //metoda nasluchujaca na custom event zmiany widoku
  initializeForm() {
    document.addEventListener("view:changed", () => this.formChecker());
  }

  cleanUpInactiveViews() {
    const inactiveViews = [
      new RegisterFormHandler(
        this.authUi,
        "register-form",
        "email-reg",
        "password-reg",
        "confirm-password"
      ),
      new ResetFormHandler(this.authUi, "forget-form", "useremail"),
    ];
    inactiveViews.forEach((handler) => {
      if (handler.destroy) {
        handler.destroy();
      }
    });
  }

  //Metoda uruchamiająca odpowiedni formularz
  formChecker() {
    // 1. Jeśli jest aktywny handler i ma metodę destroy – zniszcz go
    if (this.activeHandler?.destroy) {
      this.activeHandler.destroy();
    }
    this.activeHandler = null;
    // 2. Sprawdź, jaki formularz jest aktualnie widoczny
    const activeView = this.authUi.getActiveView();
    // 3. W zależności od widoku, uruchom odpowiedni handler
    switch (activeView) {
      case "login":
        console.log("Włączono logowanie!");
        this.loginHandler = new LoginFormHandler(
          this.authUi,
          "lgn-from",
          "email",
          "password"
        );
        this.activeHandler = this.loginHandler;

        break;

      case "register":
        console.log("Włączono rejestracje!");
        this.registerHandler = new RegisterFormHandler(
          this.authUi,
          "register-form",
          "email-reg",
          "password-reg",
          "confirm-password"
        );
        this.activeHandler = this.registerHandler;

        break;

      case "reset":
        console.log("Włączono resetowanie!");
        this.resetHandler = new ResetFormHandler(
          this.authUi,
          "forget-form",
          "useremail"
        );
        this.activeHandler = this.resetHandler;
        this.resetHandler.init();

        break;
    }
  }
}

const auth = getAuth(fireApp);
const app = new App();
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Uzytkownik zalogowany:", user.email);
    const appBody = document.getElementById("app");
    appBody.classList.remove("hidden");
    console.log(app.viewManager);
    app.viewManager.showView("todo-screen");

    const todoApp = new TodoApp(user, app.viewManager);
  }
});

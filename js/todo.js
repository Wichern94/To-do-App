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

export class TodoApp{
    constructor(user, viewManger) {
        this.user = user;
        this.viewManger =viewManger;
        this.logoutBtn = new LogoutButtonHandler('logout-btn')
        this.init();
        
    }
    init() {
        this.setupUserMenu()
        this.setupMainBurger()
        
    }
    //metoda złączajaca hamburgera usera
    setupUserMenu(){
        const userSettingsBtn = document.getElementById('user-menu-btn'); //<- przycisk złączajacy suer menu
        const userSettingsExitBtn = document.getElementById('user-menu-exit');
        const userSettings = document.getElementById('open-user-settings')
        // event na klik na przycisk usera
        userSettingsBtn?.addEventListener("click", (e) =>{
            e.preventDefault();
            userSettings.classList.remove('hidden');
            
        })
        // event na klik exita
        userSettingsExitBtn?.addEventListener("click", (e) =>{
            e.preventDefault();
            userSettings.classList.add('hidden');
        })
            
        if(userSettings.classList.contains('hidden')) {
            return console.log('usermenu ma klase hidden');
        }
            
        if(!userSettings.classList.contains('hidden'))  {
            this.logoutBtn.setLogoutListener();
        }
    }

    // metoda załączajaca główny hamburger
    setupMainBurger() {
        const userMenuBtn = document.getElementById('main-hamburger'); //<- przycisk złączajacy suer menu
        const userMenuExitBtn = document.getElementById('main-burger-exit');
        const userMenu = document.getElementById('main-burger-menu');

        userMenuBtn?.addEventListener('click', e => {
            e.preventDefault();
            userMenu.classList.remove('hidden');
        });
        userMenuExitBtn?.addEventListener('click', e => {
            userMenu.classList.add('hidden');
        })
    }
        
            
            
            
        

        
        
}
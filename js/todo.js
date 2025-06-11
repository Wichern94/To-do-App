import { FormErrors } from './uiErrorHandler.js';
export class TodoApp{
    constructor(user, viewManager) {
        this.user = user;
        this.viewManger = viewManager;
        
        this.mainHamburger = new MainMenuHandler(
            'main-hamburger','main-burger-exit','main-burger-menu')

        this.userSettings = new SettingsMenuHandler(
            'user-menu-btn','user-menu-exit','open-user-settings','logout-btn')
       
        this.taskCreator = new CreateTaskHandler(
            'ad-tsk','abandon-btn','create-task-menu','submit-task')
    }
}
//klasa do obsługi przycisku wyloguj
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

// szablon Okienek ktore pokazuje/ukrywam

export class ToggleableMenu {
    constructor(openBtnID,closeBtnID,mainMenuID){
        this.openBtn = document.getElementById(openBtnID);
        this.closeBtn = document.getElementById(closeBtnID)
        this.menu = document.getElementById(mainMenuID)
        this.bindEvents();
    }

    //metoda łapiąca eventy
bindEvents() {
this.openBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    this.menu.classList.remove('hidden')
        });
    

this.closeBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    this.menu?.classList.add('hidden');
        });
    }
    show() {
        this.menu?.classList.remove('hidden');
    }
    hide() {
        this.menu?.classList.add('hidden');
    }
}
// klasa obsługi main menu dziedziczona z szablonu menu

export class MainMenuHandler extends ToggleableMenu {
    constructor(openBtnID,closeBtnID,mainMenuID) {
        super(openBtnID,closeBtnID,mainMenuID); {

        }
    }
}
// to samo tylk  do Usersettingsow
export class SettingsMenuHandler extends ToggleableMenu {
    constructor(openBtnID,closeBtnID,mainMenuID,logoutBtnID) {
        super(openBtnID,closeBtnID,mainMenuID); {
            this.logoutBtn = new LogoutButtonHandler(logoutBtnID)
        }
    }
}


//klasa przycisku dodaj task
export class CreateTaskHandler extends ToggleableMenu {
    constructor(openBtnID,closeBtnID,mainMenuID,addBtnID,) {
        super(openBtnID,closeBtnID,mainMenuID); {
        this.handleNewTask = document.getElementById(addBtnID)
        
        this.accordions = [];
        this.setupAccordeons();
        this.setupLabelUpdates();
        this.errorHandler = new FormErrors('new-task-form');
    }
        
    }
   setupAccordeons() {
    this.accordions = [
        {
         btn: document.getElementById('tag-toggle-btn'),
         ul: document.getElementById('tag-body')
        },
        {
         btn: document.getElementById('day-toggle-btn'),
         ul: document.getElementById('day-body')
        },
        {
         btn: document.getElementById('prio-toggle-btn'),
         ul: document.getElementById('prio-body')
        },
    ];
    this.accordions.forEach((accordeon,idx,arr) => {
        accordeon.btn.addEventListener('click',() => {
            arr.forEach((other,i) => {
                if(i !==idx) {
                    other.ul.classList.add('hidden');
                }
            });
            accordeon.ul.classList.toggle('hidden');
        });
    });
}

    setupLabelUpdates() {
    const inputs =[
        ...document.querySelectorAll('input[name="tag-choice"]'),
        ...document.querySelectorAll('input[name="day-choice"]'),
        ...document.querySelectorAll('input[name="prio-choice"]')
        ];
        inputs.forEach(input => {
            input.addEventListener('change', function(event) {
                const container= event.target.closest('.tag-container');
                
                const label = container.querySelector('.tag-lbl');
                const body = container.querySelector('.tag')
                if( label) {
                    label.textContent = event.target.value;
                    body.classList.add('hidden');
                }
            })
        })
    }
                
                
                
                
            
            
        

        
}


        
        
        
    
    

    

    
    



        
            
            
            
        

        
        
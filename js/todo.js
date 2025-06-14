import { FormErrors } from './uiErrorHandler.js';
export class TodoApp{
    constructor(user, viewManager) {
        this.user = user;
        this.viewManger = viewManager;
        
        this.mainHamburger = new MainMenuHandler(
            'main-hamburger','main-burger-exit','main-burger-menu');

        this.userSettings = new SettingsMenuHandler(
            'user-menu-btn','user-menu-exit','open-user-settings','logout-btn');
        this.taskManager = new TaskManager('task-contener');
       
        this.taskCreator = new CreateTaskHandler(
            'ad-tsk','abandon-btn','create-task-menu','submit-task', this.taskManager);
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
    constructor(openBtnID,closeBtnID,mainMenuID,addBtnID,taskManager) {
        super(openBtnID,closeBtnID,mainMenuID); {
        this.taskManager = taskManager;
        this.handleNewTask = document.getElementById(addBtnID);
        this.form = document.getElementById('new-task-form');
        this.accordions = [];
        this.setupAccordeons();
        this.setupLabelUpdates();
        this.setupValidation()
        this.handleAddTask()
        this.data = this.collectFormData();
        
        this.errorHandler = new FormErrors('new-task-form');
        
    }
    //1. AKORDEONY
    //1.A) metoda  ustawiajaca akordeony

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
        accordeon.btn.addEventListener('click',(e) => {

            arr.forEach((other,i) => {
                if(i !==idx) {
                    other.ul.classList.add('hidden');
                }
            });
            this.errorHandler.clearError(e.target.name)
            accordeon.ul.classList.toggle('hidden');
        });
    });
}
    //1.B) Tutaj ustawiam wybrany etykiete akordeonu,w zaleznosci co wybierze uzytkownik.
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
    handleAddTask() {
        this.handleNewTask.addEventListener('click', e =>{
            e.preventDefault();
            const data = this.collectFormData();
            const isvalid = this.validateFormData(data);
            

            if (!isvalid) {
                return
            } else {
                this.taskManager.addTaskToUI(data)
                this.resetForm()
                this.hide()

            }
        })
    }
    resetForm() {
        this.form.reset()
    }
            
            
            
            
 // 2. validacja i pobieranie danych z formularzy
 // 2.A) tutaj usuwam błedy do pustych formularzy
    setupValidation(){
        this.form.querySelectorAll('input[type="text"], input[type="radio"]').forEach(el => {
            const eventType = el.type === 'radio' ? 'change' : 'click';
            el.addEventListener(eventType, e => {
                const name = e.target.name;
                this.errorHandler.clearError(name);
            })
        })
    }

        

    //2.B)  pobieram wartosci z inputów
    collectFormData() {
        const formData = {};
       
        const inputs = this.form.querySelectorAll('input, textarea')
        inputs.forEach(input =>{
            if (input.type === 'radio') {
                if(input.checked) {
                    formData[input.name] = input.value;
                }
            } else {
                formData[input.name] = input.value;
            }
        })
        
        return formData;
    }
    //2.C) tutaj DODAJE Błedy dla pustych formularzy
    validateFormData(formData){
       let isvalid = true;
       this.errorHandler.clearAllErrors();

       if(!formData['tytuł']?.trim()) {
        this.errorHandler.showError('tytuł','Podaj tytuł!');
        isvalid = false;
       }
       if (!formData['tag-choice']) {
        this.errorHandler.showError('tag-choice','Wybierz tag!');
        isvalid= false;
       }
       if (!formData['prio-choice']) {
        this.errorHandler.showError('prio-choice','Wybierz priorytet');
        isvalid = false;
       }
       return isvalid;
    }

}
//nowa klasa obsługujaca Dodawanie Taskow
export class TaskManager {
    constructor(ulID, toggleDescBtnID,){
        this.taskContainer = document.getElementById(ulID)
        this.descBtn = toggleDescBtnID
    }
        
        
    addTaskToUI(data) {
        const li = document.createElement('li');
        li.classList.add('task-item');
        li.innerHTML =`
            <div class="title-and-acrdon">
                <span class="task-text"></span>
                    <button class="task-acc-btn" id="task-accordeon-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                    </button>
            </div>
            <div class="item-container">
                <p class="task-details">
                                    
                </p>
                                
            </div>
            <div class="task-btn-container">
                <div class="summary">
                    <small class="task-date"></small>
                    <small class ="task-group"></small>
                    <small class ="task-prio hidden"></small>
                </div>
                <button class="delete-btn list-btns" aria-label="delete task">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
            </div>`;
        this.taskContainer.appendChild(li);
        const fieldMap= {
            'tytuł' : '.task-text',
            'desc' : '.task-details',
            'tag-choice' : '.task-group',
            'day-choice' : '.task-date',
            'prio-choice' :'.task-prio'
        }
        Object.entries(data).forEach(([key,value]) => {
            const selector = fieldMap[key];
            
            if(selector) {
             const element = li.querySelector(selector);
             if(element) element.textContent = value;
             if(key === 'prio-choice') {
                li.classList.add(`prio-${value.toLowerCase()}`);
                }
            } 
        })
    }
                
                    
                
                

            
        
            
            
            

}

        
        
                
                
                
                
            
            
        

        


        
        
        
    
    

    

    
    



        
            
            
            
        

        
        
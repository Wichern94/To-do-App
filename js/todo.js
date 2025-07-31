import { FormErrors } from './uiErrorHandler.js';
import { collection, addDoc,getDocs,doc,deleteDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { db } from './firebase-init.js';
import { serverTimestamp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import {GetCaruselPosition} from './components/carousel-settings.js'
import {RoudMapModal} from './components/roud-modal.js'
import {RoadmapSelector} from './components/roadmap-selector.js'
import {FirestoreService} from './Services/Service.js'
import {NodeElement} from './components/node-component.js'
import { RoadmapPlumbManager } from './Services/plumb-manager.js';
import {AnimationManager} from "./Services/animation-manager.js"
import {ToastManager} from "./Services/toastify-manger.js"

export class TodoApp{
    constructor(user, viewManager) {
        this.user = user;
        this.viewManger = viewManager;
        this.carusel = new GetCaruselPosition('carousel-cont','.carousel-item');
        this.firestoreService = new FirestoreService(this.user.uid);
        
        this.carusel.setCaruselToMiddle();
        this.initCarusel()
        this.nodesByRoadmap = {}
        this.activeRoadmapId = null
        this.activeRoadmapInstance = null;
        this.plumbManagers = {};
        this.AnimationManager = new AnimationManager();
        this.roudmapModal = new RoudMapModal({
            elements: {
                //przyciski
                openBtnID:'add-roadmap-task',
                closeBtnID:'manual-abandon-btn',
                handBtnID: 'hand-button',
                importBtnID:'import-button',
                subTaskBtnID: 'add-subtask-btn',
                importSubmitBtnID: 'import-submit-node',
                manualSubmitBtnID:'manual-submit-btn',
                //formularze
                importFormID:'import-node-form',
                manualFormID: 'manual-node-form',
                subTaskInputID: 'r-sub',
                roudNodeInputID: 'r-title',
                importDescID: 'import-desc',
                //kontenery
                modalID:'create-roud-menu',
                modalCheckBoxID:'roud-checkbox',
                checkBoxContainerID:'sub-container',
                subTaskUlID:'subtask-list',
                uiPanelID: 'modal-ui-panel',
            },

            callbacks: {
                //callback po wejsciu:
                 onOpen:() => {
                this.roudmapModal.setRoadmapId(this.activeRoadmapId)
                },

                // callback po dodaniu Manualnym:
                 onSubmitSuccess: async (fullData) => {
                    await this.renderNodesForRoadmap(fullData.roadmapID,fullData.id)
                    ToastManager.success('👍 Dodanie pojedynczego Elmentu Udane!');
                },
                onImportSubmit: async (allData) => {
                    const length = allData.length;
                    for(const node of allData) {
                        await this.renderNodesForRoadmap(node.roadmapID,node.id)
                    };
                    ToastManager.success(`👍 Dodano ${length} Elementów!`);
                    
                }
            },
            //Serwisy
             services: {
                firestoreService: this.firestoreService,
                animationManager: this.AnimationManager,
            }          
        });
           
           
               
                
                
        this.isroadmapcreated = false 
        this.roadmapSelector = new RoadmapSelector({
            elements: {
                titleContainerID:'roadmap-section-title',
                newMapBtnID:'new-map-btn',
                setRoadmapContainerID:'add-main-roadmap',
                setRoadmapFormID:'create-map-form',
                setInputTitleID:'create-title',
                setRoadmapSubmitBtnID:'create-submit-btn',
                abandonRoadmapSubmitBtnID:'create-abandon-btn',
                ulContainerID: 'ul-container',
                ulContDivID: 'Ul-cont-div',
                listTogglerID: 'list-toggler-ID',
                addBtnContainerID: 'add-node-btn-cont',
                },
            callbacks: {
                // calback tworzenia Roadmapy
                onSubmit:  (fullData) => {
                    console.log(console.log('%cDodanie Roadmapy Udane!', 'color: green; font-weight: bold;',fullData));
                    ToastManager.success('👍 Dodanie Roadmapy Udane!')
                },
                // calback Kasowania roadmapy  
                onDelete: async (roadmapID) => { 
                    console.log(console.log('%cUsuniecie Roadmapy Udane!', 'color: green; font-weight: bold;',roadmapID));
                    ToastManager.info('🗑️ Usunięto roadmapę!')
                },

                //calback z do wchodzenia w roadmape
                onEnterRoadmap: async (roadmapID) => {
                    await this.renderNodesForRoadmap(roadmapID);
                    const interval = setInterval(() => { // <-naprawiam linie zeby sie nie rozjechały
                    this.plumbManagers[roadmapID]?.jsPlumbInstance?.revalidate(roadmapID);
                    this.plumbManagers[roadmapID]?.jsPlumbInstance?.repaintEverything();
                }, 10); // co 10ms przez 300ms
               
                setTimeout(() => {
                    clearInterval(interval);
                }, 1500); // zatrzymaj po 300ms
                    
                    
                } ,
                //callback do wychodenia z roadmapy
                onQuitRoadmap: (roadmapID) => {
                    console.log('callback z on quit to:',roadmapID)

                    if(this.plumbManagers?.[roadmapID]) {
                    this.plumbManagers[roadmapID].destroy();
                    delete this.plumbManagers[roadmapID];
                    }
                }
              },
            services: {
                firestoreService: this.firestoreService,
                animationManager: this.AnimationManager,
            }          
        });
                        
          

            
                        
                         
                        
                
                
                
            
        
        this.mainHamburger = new MainMenuHandler(
            'main-hamburger','main-burger-exit','main-burger-menu');

        this.userSettings = new SettingsMenuHandler(
            'user-menu-btn','user-menu-exit','open-user-settings','logout-btn');
        this.taskManager = new TaskManager('task-contener',this.user);
       
        this.taskCreator = new CreateTaskHandler(
            'ad-tsk','abandon-btn','create-task-menu','submit-task', this.taskManager,this.user);
        this.loadAndRenderUserTasks();
    }
     initCarusel() {
        this.carusel.onViewChange = (mode) => {
            this.viewManger.showMode(mode.sectionId, mode.indicatorId);
            if (mode.sectionId === 'roadmap-view') {
                this.roudmapModal?.activate();
                this.roadmapSelector?.activate();

                this.firestoreService.loadUserCollection('roadmaps')
                    .then((roadmapData) => {
                        this.roadmapSelector.loadRoadmapList(roadmapData);
                    })
                    .catch((err) => {
                        console.error('błąd przy ładowaniu roudmap:', err);
                    });
                
            } else {
                this.roudmapModal?.deactivate();
                }
            }
        }
    async renderNodesForRoadmap(roadmapID, newNodeID = null){
        try{
            this.activeRoadmapId = roadmapID;
            const ul = document.getElementById(roadmapID)
            // sprawdze czy jest ul zanim utowrze plumbmangera, aby uniknac problemu
                        if(!ul) {
                            console.warn('nie znaleziono ul o id:',roadmapID);
                            return;
                        }


            // jesli plumManger juz cos ma to resetuje/usuwam
            //aby uniknac dublowania
            if(this.plumbManagers?.[roadmapID]) {
                this.plumbManagers[roadmapID].destroy();
                delete this.plumbManagers[roadmapID];
            }
            
           // kazda Roadmapa ma swoją instacje plumMangera
            this.plumbManagers[roadmapID] = new RoadmapPlumbManager(ul);

            //czyszcze roadmapy zeby uniknac dublikatów
            Array.from(ul.querySelectorAll('.roadmap-node')).forEach(child => ul.removeChild(child)); 

            //pobieram dane z bazy
            const nodeList = await this.firestoreService.getElementsfromSubCollection(
                roadmapID,
                'roadmaps',
                'nodes'
                    );
                    console.log('node list to:',nodeList);
                    if(!Array.isArray(nodeList )||nodeList.length === 0) return;

            //sortuje według order w kolejnosci od najmniejszego do nawiekszego
            const sortedNodeList = nodeList.sort( (a,b) => a.order - b.order);  
                
            const nodes = []; // <-tablica na nody  
            
            sortedNodeList.forEach((nodeData,index ) => {
            const isNew = nodeData.id === newNodeID;
            // kazdy node jest osobną  instacja NodeElement
            const node = new NodeElement(
                nodeData,
                this.plumbManagers[roadmapID],
                this.firestoreService,
                {   
                    isNew,
                    onDelete:this.handleNodeDeleted.bind(this)
                }
            )
            
                // renderuje i dodaje do tablicy
            node.render();
            
            node.setNodeListForRoadmap(nodes,this.plumbManagers);
            nodes.push(node)
        
            if(index === 0) {
                node.enableNode();
            } else {
                node.disableNode()
            } 

            });
            //flaga
            let activeNode = null;
            // sprawdzam czy były aktywne
            nodes.forEach(node => {  
                if( node.nodeData.wasActive === true) {
                    activeNode = node;
                }
            });
            // jesli byly rysuje linie i aktywuje przyciski
            if(activeNode) {
                activeNode.setActive();
                activeNode.drawConnectionLines();
            }
            this.nodesByRoadmap[roadmapID] = nodes;

    } catch (err) {
        console.error('błąd przy wczytywaniu roadmapy:', err);
    }
}

    async handleNodeDeleted(deletedNode){
        const roadmap = deletedNode.nodeData.roadmapID;
        const nodeList = this.nodesByRoadmap[roadmap];

        const index = nodeList.findIndex(n =>n.nodeData.id === deletedNode.nodeData.id);
        if(index === -1)return;

        nodeList.splice(index,1);

       
            //  await this.renderNodesForRoadmap(this.activeRoadmapId);
    } 
            

            


            

        
                    

    
             
                    
        
                
                
               
                

                        
                   

            
       
     
  async  loadAndRenderUserTasks(){
        try {
        const storagedTasks =await this.taskManager.loadUserTasks(this.user.uid);
        storagedTasks.forEach(task => this.taskManager.addTaskToUI(task));
        } catch (error) {
            console.error('błąd przy ładowaniu i renderowaniu zadań:', error)
        }
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
                window.location.reload();
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
    constructor(openBtnID,closeBtnID,mainMenuID,addBtnID,taskManager,user) {
        super(openBtnID,closeBtnID,mainMenuID); {
        this.taskManager = taskManager;
        this.user = user;
        this.handleNewTask = document.getElementById(addBtnID);
        this.form = document.getElementById('new-task-form');
        this.accordions = [];
        this.setupAccordeons();
        this.setupLabelUpdates();
        this.setupValidation()
        this.handleAddTask()
        this.taskdata = this.taskManager.loadUserTasks(this.user.uid)
        
        
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
   async handleAddTask() {
        this.handleNewTask.addEventListener('click', async e => {
            e.preventDefault();
            const formData = this.collectFormData()
            const isvalid = this.validateFormData(formData);
            if (!isvalid) return;
            const data = {
            ...formData,
            uid: this.user.uid,
            createdAt: serverTimestamp()
            }; 

            
            

            
            
            const firebaseID = await this.taskManager.saveTaskToFirestore(data);

            if(firebaseID) {
            this.taskManager.addTaskToUI({...data, id: firebaseID});
            this.resetForm()
                this.hide()
            } else {
                alert('Nie udało sie zapisac zadania w bazie');
            }
        });
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
    constructor(ulID,user){
        this.taskContainer = document.getElementById(ulID)
        this.user = user
        
    }
        
        
    addTaskToUI(data) {
        
        const li = document.createElement('li');
        li.classList.add('task-item');
        if(data.id){
            li.dataset.id = data.id
            
        }
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
            this.bindTaskEvents(li)
        
        
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
        return li
    }
    async saveTaskToFirestore (data) {
        try {
            const userTaskRef = collection(db,`users/${data.uid}/tasks`);
            const docRef = await addDoc(userTaskRef, data);
            return docRef.id;
        } catch (error) {
            console.error('błąd przy zapisie do Firestore:',error);
            return null;
        }
    }
    async loadUserTasks(uid) {
        try {
            const TaskRef = collection(db,`users/${uid}/tasks`);
            const docQuery = await getDocs(TaskRef)
            const tasks =[];
            docQuery.forEach((doc) => {
                tasks.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            console.log('zadania uzytkownika:', tasks);
            
            return tasks
        } catch (error) {
            console.error ('błąd przy odczycie  od firestore:', error);
            return [];
        }
    }
    async deleteTask(id,li){
        try {
            const docRef = doc(db, `users/${this.user.uid}/tasks/${id}`);
            await deleteDoc(docRef);
            li.remove();
        } catch (error) {
            console.error('bład przy usuwaniu zadania:', error);
        }
    }
    bindTaskEvents(li) {
        //pobieram Elementy
        const deleteBtn = li.querySelector('.delete-btn');
        const accBtn = li.querySelector('.task-acc-btn');
        const descContainer = li.querySelector('.task-details');

        //1.Akordeon tasków
        if(accBtn && descContainer) {
            accBtn.addEventListener('click', () => {
            descContainer.classList.toggle('hidden')
                }
        ) }
        //2. Usuwanie
        deleteBtn?.addEventListener('click', () => {
            const id = li.dataset.id;
            this.deleteTask(id,li);
        })
    }       
        
}
 
                
                    
                
                

            
        
            
            
            


        
        
                
                
                
                
            
            
        

        


        
        
        
    
    

    

    
    



        
            
            
            
        

        
        
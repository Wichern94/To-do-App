import { FormErrors } from '../uiErrorHandler.js';
import {AnimationManager} from "../Services/animation-manager.js"
import { showElement,hideElement,toggleElement } from "../utils/helper.js";
export class RoudMapModal {
    constructor({elements, callbacks = {}, services ={} }) {
        // Elementy Ui
        this.elements = {
            //przyciski:
            openBtn: document.getElementById(elements.openBtnID),
            closeBtn: document.getElementById(elements.closeBtnID),
            handSwitchBtn: document.getElementById(elements.handBtnID),
            importSwitchBtn: document.getElementById(elements.importBtnID),
            subTaskBtn: document.getElementById(elements.subTaskBtnID),
            manualSubmitBtn: document.getElementById(elements.manualSubmitBtnID),
            // elementy formularza:
            importForm: document.getElementById(elements.importFormID),
            manualForm: document.getElementById(elements.manualFormID),
            subTaskInput: document.getElementById(elements.subTaskInputID),
            roudNodeInput: document.getElementById(elements.roudNodeInputID),
            modalCheckBox: document.getElementById(elements.modalCheckBoxID),
            //kontenery:
            modal: document.getElementById(elements.modalID),
            checkBoxContainer: document.getElementById(elements.checkBoxContainerID),
            subTaskUl: document.getElementById(elements.subTaskUlID),
        };
        // CallBacki:
        this.onOpen = callbacks.onOpen || null;
        this.onManualSubmit = callbacks.onManualSubmit || null;
        this.onImportSubmit = callbacks.onImportSubmit || null;
        //Zewnętrzne serwisy:
        this.manualFormErr = new FormErrors('manual-node-form');
        this.importFormErr = new FormErrors('import-node-form');
        this.animationManager = services.animationManager || null;
        this.firebaseServices =services.firestoreService || null;
        // pojemniki:
        this.subTaskValues = [];
        this.activeRoadmapId = null;
        //Metody
        this.activeAnimations();
        // Listenery:
        this.listeners = [      // musze z bindowac metody zeby dało sie odpinac listenery,
                            // gdybym nie zbindował to by metody wskazywały na element dom anie klase.
            { el: 'openBtn', event: 'click', handler: this.showAddModal.bind(this) },
            { el: 'closeBtn', event: 'click', handler: this.hideAddModal.bind(this) },
            { el: 'importSwitchBtn', event: 'click', handler: this.showImportSection.bind(this) },
            { el: 'handSwitchBtn', event: 'click', handler: this.showManualSection.bind(this) },
            { el: 'modalCheckBox', event: 'change', handler: this.handleCheckboxChange.bind(this) },
            { el: 'subTaskBtn', event: 'click', handler: this.handleAddSubTask.bind(this) },
            { el: 'manualForm', event: 'click', handler: this.handleClearError.bind(this) },
            { el: 'manualSubmitBtn', event: 'click', handler: this.handleManualSubmit.bind(this)}
            
        ];
    }
            
            // tu Bedę właczac modal
        activate() {
            // sprawdzam czy wszystie elementy istnieją:
            Object.entries(this.elements).forEach(([key, el]) =>{
                if (!el) {
                    console.warn(`Brakuje Elementu dom:${key}`);
                }
            });
            this.listeners.forEach(({ el,event, handler}) => {
                this.elements[el]?.addEventListener(event,handler);
            });
        }
        //tu Wyłączac    
        deactivate() {
            this.listeners.forEach(({ el,event,handler}) => {
                this.elements[el]?.removeEventListener(event, handler)
            })
        };
        activeAnimations(){
            const addBtn = this.elements.openBtn;
            if (addBtn) {
                this.animationManager?.bounceBtn(addBtn);
            } else {
                console.log('brak przycisku do animacji w dom!')
            }
        
        
        }
    
        
        showAddModal() {
            this.elements.modal?.classList.remove('hidden');
            if(typeof this.onOpen === 'function') this.onOpen();
        }
        hideAddModal() {
            this.elements.modal?.classList.add('hidden');
            this.subTaskValues = [];
            this.manualFormErr.clearAllErrors()
            this.elements.subTaskUl.innerHTML = '';
            this.elements.roudNodeInput.value = '';
            this.elements.subTaskInput.value = '';
            if(this.elements.modalCheckBox.checked) {
                this.handleCheckboxChange();
                this.elements.modalCheckBox.checked = false;
            }
            
        }
        showImportSection() {
            this.elements.importForm?.classList.remove('hidden');
            if(this.elements.manualForm) this.elements.manualForm.classList.add('hidden')
        }
        showManualSection() {
            this.elements.manualForm?.classList.remove('hidden');
            if(this.elements.importForm) this.elements.importForm.classList.add('hidden')
        }
        handleCheckboxChange() {
            this.elements.checkBoxContainer?.classList.toggle('hidden')
            this.elements.subTaskUl?.classList.toggle('hidden');
            this.elements.subTaskUl.innerHTML = '';
        }
            
        handleAddSubTask(e) {
            e.preventDefault()
            const inputValue = this.elements.subTaskInput.value.trim();
            if (!inputValue) {
                this.manualFormErr.showError('roud-sub','Podaj Nazwe!');
              return  
            }  
            if (this.subTaskValues.includes(inputValue)) return;
            

            this.subTaskValues.push(inputValue);
            this.elements.subTaskInput.value = '';

            this.elements.subTaskUl.innerHTML = ''
            this.subTaskValues.forEach(value => {
                const li = document.createElement('li');
                li.textContent = value;
                li.classList.add('sub-elements');
                this.elements.subTaskUl.appendChild(li);
                
            });
        }
        handleClearError(e){
            this.manualFormErr.clearError(e.target.name);
        }
        handleManualSubmit(e) {
            e.preventDefault()
            const nameInputData = this.elements.roudNodeInput.value.trim()
            if(!nameInputData) {
                this.manualFormErr.showError('roud-title','Nazwij element!');
                return
            }
            const nodeData = {
                title: nameInputData,
                subtasks:[...this.subTaskValues],
                roadmapID: this.activeRoadmapId,
            }
            if(!this.elements.modalCheckBox.checked) {
                nodeData.subtasks = [];
            }
            
             if(typeof this.onManualSubmit === 'function') { 
                this.onManualSubmit(nodeData);
                this.hideAddModal()
             }
             
            return nodeData;
            
        }
        setRoadmapId(roadmapID){
            this.activeRoadmapId = roadmapID;
            console.log('roadmapid w roud-modal to:', roadmapID);
            
        }
        
            
            
            
            
                
        }
            
            
            
            
                
            
    
        
        
        
        
        
        
    
    
        
        
        

            
    
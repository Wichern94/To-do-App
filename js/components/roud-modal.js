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
            importSubmitBtn: document.getElementById(elements.importSubmitBtnID),
            // elementy formularza:
            importForm: document.getElementById(elements.importFormID),
            manualForm: document.getElementById(elements.manualFormID),
            subTaskInput: document.getElementById(elements.subTaskInputID),
            roudNodeInput: document.getElementById(elements.roudNodeInputID),
            modalCheckBox: document.getElementById(elements.modalCheckBoxID),
            importDesc: document.getElementById(elements.importDescID),
            //kontenery:
            modal: document.getElementById(elements.modalID),
            checkBoxContainer: document.getElementById(elements.checkBoxContainerID),
            subTaskUl: document.getElementById(elements.subTaskUlID),
            uiPanel: document.getElementById(elements.uiPanelID)
        };
        // CallBacki:
        this.onOpen = callbacks.onOpen || null;
        this.onSubmitSuccess = callbacks.onSubmitSuccess || null;
        this.onImportSubmit = callbacks.onImportSubmit || null;
        //Zewnętrzne serwisy:
        this.manualFormErr = new FormErrors('manual-node-form');
        this.importFormErr = new FormErrors('import-node-form');
        this.animationManager = services.animationManager || null;
        this.firestoreService =services.firestoreService || null;
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
            
            { el: 'modalCheckBox', event: 'change', handler: this.handleCheckboxChange.bind(this) },
            { el: 'uiPanel', event: 'click', handler: this.handleModalClick.bind(this) },

            { el: 'subTaskBtn', event: 'click', handler: this.handleAddSubTask.bind(this) },
            { el: 'manualForm', event: 'click', handler: this.handleClearError.bind(this) },
            { el: 'manualSubmitBtn', event: 'click', handler: this.handleManualSubmit.bind(this)},
            { el: 'importSubmitBtn', event: 'click', handler: this.handleImportSubmit.bind(this)}
            
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
        
        async showAddModal() {
             const bluredOne = this.elements.modal;
             const fieldset = this.elements.uiPanel;
             await this.animationManager.blurInElement(bluredOne);
             await this.animationManager.showAnimation(fieldset,'bounceInUp','1s');
             if(typeof this.onOpen === 'function') this.onOpen();
         }
        
        async hideAddModal() {
            const bluredOne = this.elements.modal;
            const fieldset = this.elements.uiPanel;
  
            await this.animationManager.hideAnimation(fieldset,'bounceOutDown','1s');
            await this.animationManager.blurOutElement(bluredOne);
              
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
              
        handleModalClick(e){
            const handBtn = e.target.closest('.hand-btn '); //<- wybieram przycisk najblizszy targtowi eventu
            const importBtn = e.target.closest('.import-btn');
            
            if(handBtn){
                this.showSection(handBtn)
            } else if(importBtn){
                this.showSection(importBtn);
            }
        }
    
        async showSection(button) {
            const importForm = this.elements.importForm;
            const manualForm = this.elements.manualForm;
 
            if(button.classList.contains('hand-btn')){
                hideElement(importForm);
                await this.animationManager.showAnimation(manualForm,'fadeIn','.5s');
                 
            } else{
                hideElement(manualForm);
                await this.animationManager.showAnimation(importForm,'fadeIn','.5s');
            }
        }
        
        async handleCheckboxChange() {
             const checkboxes =this.elements.checkBoxContainer;
             const subtasks = this.elements.subTaskUl;

             this.animationManager.elementToggle(checkboxes,subtasks);
             this.elements.subTaskUl.innerHTML = '';
            }
             
        async handleAddSubTask(e) {
            e.preventDefault()
                 
            const inputValue = this.elements.subTaskInput.value.trim();
            if (!inputValue) {
                this.manualFormErr.showError('roud-sub','Podaj Nazwe!');
                this.animationManager.addElementAnimation(this.elements.subTaskBtn,'shakeX','1s')
            return  
            }  
            if (this.subTaskValues.includes(inputValue)) return;
                 
            this.animationManager.addElementAnimation(this.elements.subTaskBtn,'shakeY','1s')
            this.subTaskValues.push(inputValue);
            this.elements.subTaskInput.value = '';
     
            this.elements.subTaskUl.innerHTML = ''
            this.subTaskValues.forEach(async (value) => {
                const li = document.createElement('li');
                li.textContent = value;
                li.classList.add('sub-elements');
                this.elements.subTaskUl.appendChild(li);
                await this.animationManager.showAnimation(li,'fadeIn','.5s');
     
                     
                });
            }
             
            handleClearError(e){
                this.manualFormErr.clearError(e.target.name);
            }
                 
            // metoda Zapisu Danych  Noda do Bazy danych
           async handleManualSubmit(e) {
                e.preventDefault()
                try{
                    const nameInputData = this.elements.roudNodeInput.value.trim() //<- usuwam białe znaki
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
                    //pobieram dane o instniejacych nodach
                    const existingNodes = await this.firestoreService.getElementsfromSubCollection(
                        nodeData.roadmapID,
                        'roadmaps',
                        'nodes'
                        );
                         // nadaje Order 
                        const order = Array.isArray(existingNodes) ? existingNodes.length : 0;
                        const nodeDataWithOrder={...nodeData,order: order, wasActive:false }
                        // dodaje element do kolekcji
                        this.isNodeSubmitting = true;
                        const nodeID = await this.firestoreService.addCollectionElement(nodeDataWithOrder,'roadmaps','nodes')
                        if(!nodeID) throw new Error('nie znaleziono node ID!',)
                        //dane pelne dane z orderem oraz id
                        const fullData = {...nodeDataWithOrder, id: nodeID};
                        console.log('roadmapID w manualSubmit',fullData);
    
    
                    if(typeof this.onSubmitSuccess === 'function') { 
                        this.onSubmitSuccess(fullData);
                        this.hideAddModal()
                    }
                    return fullData;
                } catch (error) {
                    console.error('bład tworzenia Noda!', error)
                } finally {
                    this.isNodeSubmitting = false;
                }
            }
        handleImportSubmit() {
            const textarea = this.elements.importDesc;
            const values = textarea.value;
            this.parseRoadmapText(values);
            
            

        }
        parseRoadmapText(rawText) {
            const lines  = rawText.split('/n').map(line =>line.trim());
            console.log( 'linie bez białych:',lines);
            
            
        }
       
                    
                
                  
        setRoadmapId(roadmapID){
            this.activeRoadmapId = roadmapID;
            console.log('roadmapid w roud-modal to:', roadmapID);
                
            }
        }
            
                
                
                
                
                    
        
           

               
                 

                
         

            
            
        
            
            
            
            
                
            
    
        
        
        
        
        
        
    
    
        
        
        

            
    
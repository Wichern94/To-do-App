import { FormErrors } from '../uiErrorHandler.js';
export class RoudMapModal {
    constructor({
        openBtnID,
        modalID,
        closeBtnID,
        onOpen = null,
        handBtnID,
        importBtnID,
        importFormID,
        manualFormID,
        modalCheckBoxID,
        checkBoxContainerID,
        subTaskInputID,
        subTaskBtnID,
        subTaskUlID
        }) {

        this.elements = {
            openBtn: document.getElementById(openBtnID),
            modal: document.getElementById(modalID),
            closeBtn: document.getElementById(closeBtnID),
            handSwitchBtn: document.getElementById(handBtnID),
            importSwitchBtn: document.getElementById(importBtnID),
            importForm: document.getElementById(importFormID),
            manualForm: document.getElementById(manualFormID),
            modalCheckBox: document.getElementById(modalCheckBoxID),
            checkBoxContainer: document.getElementById(checkBoxContainerID),
            subTaskInput: document.getElementById(subTaskInputID),
            subTaskBtn: document.getElementById(subTaskBtnID),
            subTaskUl: document.getElementById(subTaskUlID)
        };
        this.manualFormErr = new FormErrors('manual-node-form');
        this.importFormErr = new FormErrors('import-node-form');
        this.subTaskValues = [];
        this.onOpen = onOpen;
        // musze z bindowac metody zeby dało sie odpinac listenery,
        // gdybym nie zbindował to by metody wskazywały na element dom anie klase.
        this.listeners = [
            { el: 'openBtn', event: 'click', handler: this.showAddModal.bind(this) },
            { el: 'closeBtn', event: 'click', handler: this.hideAddModal.bind(this) },
            { el: 'importSwitchBtn', event: 'click', handler: this.showImportSection.bind(this) },
            { el: 'handSwitchBtn', event: 'click', handler: this.showManualSection.bind(this) },
            { el: 'modalCheckBox', event: 'change', handler: this.handleCheckboxChange.bind(this) },
            { el: 'subTaskBtn', event: 'click', handler: this.handleAddSubTask.bind(this) },
            { el: 'manualForm', event: 'click', handler: this.handleClearError.bind(this) },
            
        ];
    }
            
            // tu Bedę właczac modal
        activate() {
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
    
        
        showAddModal() {
            this.elements.modal?.classList.remove('hidden');
            if(typeof this.onOpen === 'function') this.onOpen();
        }
        hideAddModal() {
            this.elements.modal?.classList.add('hidden');
            this.subTaskValues = [];
            this.elements.subTaskUl.innerHTML = '';
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
                this.manualFormErr.showError('roud-sub','Podaj Nazwe');
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
        handleClearError(){
            this.manualFormErr.clearError(event.target.name);
        }
            
            
            
            
                
        }
            
            
            
            
                
            
    
        
        
        
        
        
        
    
    
        
        
        

            
    
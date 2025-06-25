export class RoudMapModal {
    constructor({
        openBtnID,
        modalID,
        closeBtnID,
        onOpen = null,
        handBtnID,
        importBtnID,
        importFormID,
        manualFormID}) {

        this.elements = {
            openBtn: document.getElementById(openBtnID),
            modal: document.getElementById(modalID),
            closeBtn: document.getElementById(closeBtnID),
            handSwitchBtn: document.getElementById(handBtnID),
            importSwitchBtn: document.getElementById(importBtnID),
            importForm: document.getElementById(importFormID),
            manualForm: document.getElementById(manualFormID),
        };
        this.onOpen = onOpen;
        // musze z bindowac metody zeby dało sie odpinac listenery
        this.listeners = [
            { el: 'openBtn', event: 'click', handler: this.showAddModal.bind(this) },
            { el: 'closeBtn', event: 'click', handler: this.hideAddModal.bind(this) },
            { el: 'importSwitchBtn', event: 'click', handler: this.showImportSection.bind(this) },
            { el: 'handSwitchBtn', event: 'click', handler: this.showManualSection.bind(this) }
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
        }
        showImportSection() {
            this.elements.importForm?.classList.remove('hidden');
            if(this.elements.manualForm) this.elements.manualForm.classList.add('hidden')
        }
        showManualSection() {
            this.elements.manualForm?.classList.remove('hidden');
            if(this.elements.importForm) this.elements.importForm.classList.add('hidden')
        }
            
            
            
            
                
            
    }
        
        
        
        
        
        
    
    
        
        
        

            
    
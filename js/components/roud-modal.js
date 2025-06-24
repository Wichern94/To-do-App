export class RoudMapModal {
    constructor(addBtnID, modalContainerID,abandonBtnID) {
        this.showbtn = document.getElementById(addBtnID);
        this.modalWindow = document.getElementById(modalContainerID);
        this.abandonBtn = document.getElementById(abandonBtnID)
        this.init();
        
    }
    init() {
        this.showbtn?.addEventListener('click',()  => {
            this.showAddModal();
        });
        this.abandonBtn?.addEventListener('click', () =>{
            this.hideAddModal();
        });
            
    }
    showAddModal() {
        this.modalWindow?.classList.remove('hidden');
    }
    hideAddModal() {
        this.modalWindow?.classList.add('hidden');
    }
        
        
        
        
            
        
}
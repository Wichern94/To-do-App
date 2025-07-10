import { showElement,hideElement,toggleElement } from "../utils/helper.js";

export class NodeElement {
    constructor(fullNodeData,plumbManager, callbacks = {}) {
        this.nodeData = fullNodeData;
        this.plumbManager = plumbManager,
        this.ui = {};
        this.isActive = false;
        this.isAccordionReady = false;
        this.listenersBound = false;
        this.connectionDrawn = false;
        this.progressStep = null;
        // jesli callback nie jest podany  to domyslnie jest null a jesli jest podany to zostanie przypisany
        this.onNodeActivate = callbacks.onNodeActivate || null;
        
        

        
    }
   //Metoda renderowania elementów roadmapy
    render(){
        
        const ulID = this.nodeData.roadmapID;
        const rightUl = document.getElementById(ulID);
        const title= this.nodeData.title;
        const subUlID =`sub-${this.nodeData.id}` //<-tworze id dla pojemnika na subtaski
        const li = document.createElement('li');
        li.classList.add('roadmap-node','disabled-node');
        
        if(this.nodeData.id){
            li.dataset.id = this.nodeData.id //<-nadaje id takie jak ten z firebase
            li.id = `node-${this.nodeData.id}`
        }
        if(this.nodeData.order % 2 === 0) {
            li.classList.add('left');
        } else {
            li.classList.add('right');
        }
    
        //tworze html noda
        li.innerHTML =`
        
          
          <div class="title-roudmap">
              <span class="node-text">${title}</span>
              <span class="node-time">0:00</span>
              <button class="node-acc-btn " id="roadmap-accordeon-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                      stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
              </button>
        </div>         
              
              
            
            
              
            <div class="node-btn-container ">
                <button class="stop-btn roud-btns hidden" aria-label="stop timer">Zatrzymaj
                    <svg class="roud-btns-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
                    </svg>
                </button>
                 
                  <button class="play-btn roud-btns hidden" aria-label="start timer">Rozpocznij
                    <svg  class="roud-btns-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                    </svg>
                </button>
            </div>
                
            <div class="progress-container hidden">
                
               

                <div class="progress-bar">
                    <div class="progress-fill"></div>
                    <span class="progress-text"></span>
                </div>
                
            </div>
    
            <ul id ="${subUlID}" class="subtask-list hidden">
                    
                </ul>
            `;
        this.ui.root = li;
        this.ui.timer = li.querySelector('.node-time');
        this.ui.progressBarCont = li.querySelector('.progress-container');
        this.ui.accordionBtn = li.querySelector('.node-acc-btn');
        this.ui.startBtn = li.querySelector('.play-btn');
        this.ui.stopBtn = li.querySelector('.stop-btn');
        this.ui.btnContainer = li.querySelector('.node-btn-container');
        this.ui.subtaskList = li.querySelector('.subtask-list');
        this.ui.progressText = li.querySelector('.progress-text');
        this.ui.progressFill = li.querySelector('.progress-fill');
        this.ui.timer = li.querySelector('.node-time')
        

        

        rightUl?.appendChild(li); // <-dodaje do odpowiedniego UL
        
        const subtasks = this.nodeData.subtasks;
        if(!Array.isArray(subtasks) || subtasks.length === 0) { // <- jesli subtask jest tablica, i nie jest pusta
            return
        }
        
        
        const getSubUL = document.getElementById(subUlID);
        if (getSubUL){ // jezeli mamy juz  odpowiedni ul 
            
            subtasks.forEach((subtask) => {
                const subLi = document.createElement('li');
                subLi.classList.add('subtask-item');
                subLi.dataset.id = `subLi-${this.nodeData.id}`
                subLi.innerHTML = `
                    <label class="subtask">
                            <input type="checkbox" class = "roud-disabld-checkbox" />
                            <span class="custom-check"></span>
                            <span class="subtask-text">${subtask}</span>
                    </label>`;
                
                getSubUL.appendChild(subLi);
            });
            this.ui.checkBoxList = li.querySelectorAll('.roud-disabld-checkbox');
            
            
        }
    }
    enableNode() {
        
        this.ui.root?.classList.remove('disabled-node');
        showElement(this.ui.startBtn);
        this.ui.startBtn?.addEventListener('click',this.setActive.bind(this));
        hideElement(this.ui.timer);
        this.setupAccordeons()
        //blokuje checkboxy
        this.ui.checkBoxList?.forEach(cb => {
            cb.disabled = true;
        });
        

    }
    disableNode(){
        
        this.ui.root?.classList.add('disabled-node');
        hideElement(this.ui.btnContainer);
        hideElement(this.ui.timer);

        this.setupAccordeons();

        
    }
    //metoda Aktywacji Roadmapy
    setActive() {
         if (this.isActive) {

            if(!this.connectionDrawn) {
                this.drawConnectionLine();
                this.connectionDrawn = true;
            }
            return;
         }
        this.isActive = true;
        this.nodeData.wasActive = true;
        
        this.ui.root.classList.add('active-border');
        showElement(this.ui.stopBtn);
        showElement(this.ui.progressBarCont);
        showElement(this.ui.timer);
        
         //odblokuje checkboxy
        this.ui.checkBoxList?.forEach(cb => {
            cb.disabled = false;
        });
        
        // obliczenia dotyczace checkboxów
        const checkBoxLenght = this.ui.checkBoxList.length;
        this.progressStep = 100 / checkBoxLenght;

        if(!this.listenersBound){
        this.ui.checkBoxList.forEach(cb => {
            cb.addEventListener('change', this.updateProgress.bind(this));
        });
        this.listenersBound = true;
    }
       
        // rysowanie liini oraz zapis updatowanego noda do bazy
        
        this.drawConnectionLine()
        this.connectionDrawn = true;

        if(typeof this.onNodeActivate === 'function') {
            console.log('[setActive] Wywołuję callback onNodeActivate z id:', this.nodeData.id);
            this.onNodeActivate(this.nodeData.id);
        }
         
       

      
       
       
    }
        
        


            

            
    
   
    //metoda ustawiająca Akordeony
    setupAccordeons() {
        if (this.isAccordionReady) return;   //flaga zeby akordeon nie właczał sie kilka razy
         const accBtn = this.ui.accordionBtn;
         accBtn?.addEventListener('click',() => {
            console.log('kliknieto wakordeon:',this.ui.root);
            
            const subTaskCont = this.ui.subtaskList;
            console.log('checkboxwo to:', subTaskCont);
            
            toggleElement(subTaskCont);
            
         });
        this.isAccordionReady = true; 
    }
    updateProgress() {
        const checkedCount = Array.from(this.ui.checkBoxList).filter(cb => cb.checked).length;
        const percent = Math.round(checkedCount * this.progressStep);
        
        if(this.ui.progressText) {
            this.ui.progressText.textContent = `${percent}%`;
            this.ui.progressFill.style.width = `${percent}%`;
        }
    }
    //metoda Rysuwania linni biblioteką jsPlumb
    drawConnectionLine() {
        
        
        const mainNode = this.ui.root;
        console.log('current to:',mainNode);
        
        const nextNode = mainNode?.nextElementSibling; // <- nastepny taki sam element
        console.log('next to:',nextNode);

        if( !mainNode.id || !nextNode.id) {
            console.warn ('brak id dla nodów - nie mozna rysowac lini.');
            return
        }
        
        

    
    this.plumbManager?.connect(mainNode.id, nextNode.id);
        
        
        
        
        
        
        
       
    }
}

        
            
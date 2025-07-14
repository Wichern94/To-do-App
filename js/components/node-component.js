import { showElement,hideElement,toggleElement } from "../utils/helper.js";

export class NodeElement {
    constructor(fullNodeData,plumbManager,firestoreService ) {
        this.nodeData = fullNodeData;
        this.plumbManager = plumbManager,
        this.firestoreService = firestoreService;
        this.ui = {};
        this.isActive = false;
        this.isAccordionReady = false;
        this.listenersBound = false;
        this.connectionDrawn = false;
        this.progressStep = null;
        this.timerInterval = null;
        this.timerSeconds = this.nodeData.timerSeconds || 0 ;
        this.nodeData.paused = this.nodeData.paused || false;
        this.isListening = false;
       
        
        

        
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
            li.dataset.order = this.nodeData.order;
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
              <span class="node-time"></span>
              <button class="node-acc-btn " id="roadmap-accordeon-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                      stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
              </button>
        </div>         
              
              
            
            
              
            <div class="node-btn-container ">
                <button class="stop-btn roud-btns hidden" aria-label="finish node">Zatrzymaj
                    <svg class="roud-btns-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
                    </svg>
                </button>
                 
                  <button class="play-btn roud-btns hidden" aria-label="start node">Rozpocznij
                    <svg  class="roud-btns-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                    </svg>
                </button>

                <button class= "pause-btn roud-btns hidden" aria-label="Pause node">Pauza
                    <svg class="roud-btns-svg"xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                    </svg>
                </button>

                 <button class="continue-btn roud-btns hidden" aria-label="start node">Wznów
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
        this.ui.pauseBtn = li.querySelector('.pause-btn')
        this.ui.continueBtn = li.querySelector('.continue-btn');
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
         if (this.isActive)  return;
         
           
         
        this.isActive = true;
        this.nodeData.wasActive = true;
        
        this.ui.root.classList.add('active-border');
        showElement(this.ui.stopBtn);
        showElement(this.ui.timer);
        hideElement(this.ui.startBtn);
        showElement(this.ui.pauseBtn);

        this.setupCheckBoxes()
        this.drawConnectionLines()

        if(!this.nodeData.paused) {
          this.startTimer();  
        } else {
            showElement(this.ui.continueBtn);
            hideElement(this.ui.pauseBtn);
            this.togglePauseAndContinue();
        }
        
        this.realTimeListener();
       

       
        }
                        
                       
                   
         
    //metoda ustawiająca Akordeony
    setupAccordeons() {
        if (this.isAccordionReady) return;   //flaga zeby akordeon nie właczał sie kilka razy
         const accBtn = this.ui.accordionBtn;
         accBtn?.addEventListener('click',() => {
             const subTaskCont = this.ui.subtaskList;
             toggleElement(subTaskCont);
             this.plumbManager.jsPlumbInstance.repaintEverything();
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
        setupCheckBoxes(){
             //pobieram checkboxy 
            const checkboxes = this.ui.checkBoxList;
            const checkBoxLenght = checkboxes?.length || 0;
            // obliczenia dotyczace checkboxów
            if(checkBoxLenght === 0) {
                hideElement(this.ui.progressBarCont); // upewniam sie ze nie pokazuje progressbaru jesli nie ma subtaskow
                return
            }
    
                showElement(this.ui.progressBarCont);
                this.progressStep = 100 / checkBoxLenght;
            
             //odblokuje checkboxy
            checkboxes?.forEach(cb => {
                cb.disabled = false;
            });
            
           // dodaje nasłuch
           if(!this.listenersBound){
               checkboxes.forEach(cb => {
                    cb.addEventListener('change', this.updateProgress.bind(this));
                });
                this.listenersBound = true;
            }
        }
        //metoda Rysuwania linni biblioteką jsPlumb
        drawConnectionLines() {
            const ulID = this.nodeData.roadmapID;
            const rightUl = document.getElementById(ulID);
            const allNodes = Array.from(rightUl.querySelectorAll('.roadmap-node'));
            const sortedNodes = allNodes.sort((a,b) =>{
                const orderA = Number(a.dataset.order); // Number zmienia dataset order string na liczbe
                const orderB = Number(b.dataset.order);
                return orderA - orderB;
            });
            
            const anchorsLeftRight = ['Right', 'Left'];
            const anchorsTopBottom = ['Bottom','Top' ];
            
    
            sortedNodes.forEach((currentNode, index) => {
                const nextNode =sortedNodes[index + 1];
                if(!nextNode) return;
                    const anchors = (index % 2 === 0 )? anchorsTopBottom: anchorsLeftRight; // jesli parzysta to top-bottom, jesli nie to left-right
                        
                    this.plumbManager?.connect(currentNode.id, nextNode.id,anchors)
                        
                    });
                }
    
    
        
        startTimer() {
            this.nodeData.isRuning = true;
            this.setupPause()
            const updatedData = {
                wasActive: true,
                isRunning: true,
                paused: false,
                timerSeconds: this.timerSeconds || 0,
                 
            };

            this.firestoreService.updateElements(
                this.nodeData.roadmapID,
                'roadmaps',
                'nodes',
                this.nodeData.id,
                updatedData
            );
            console.log('uruchomiono licznik');
            
            
            this.timerInterval = setInterval(() => {
            this.timerSeconds++;
            this.ui.timer.textContent = this.formatTime(this.timerSeconds);
           },1000);
        }
        formatTime(seconds) {

            const totalMinutes = Math.floor(seconds / 60);//<- dzielenie z obcięciem czesci po przecinku
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;    //<- zwraca reszte z dzielenia
            const secs = seconds % 60 ;

            //podziel sekundy przez 60, zmien na string,
            //i jesli sa mniej niz dwa znaki dodaj 0 przed liczba
            const h = hours.toString().padStart(2,'0');
            const m = mins.toString().padStart(2,'0');
            const s = secs.toString().padStart(2, '0');
            return `${h}:${m}:${s}`;
        }
        pauseTimer(){
            if(this.timerInterval) {
            console.log('zatrzymano licznik');
            this.setupContinue()
            
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            }

            this.nodeData.isRunning = false;

            const updatedData = {
                isRunning: false,
                paused:true,
                timerSeconds: this.timerSeconds
            };
            this.firestoreService.updateElements(
                this.nodeData.roadmapID,
                'roadmaps',
                'nodes',
                this.nodeData.id,
                updatedData
            );
            
        }
        stopTimer() {
            clearInterval(this.timerInterval);
        }
        updateTimerDisplay(){
             this.ui.timer.textContent = this.formatTime(this.timerSeconds);
        }

        //obsluga FirebaseRealtime w NodeElement:
        realTimeListener() {
            if(this.isListening) return
            
            this.unsubRealTime = this.firestoreService.listenToElement(
                this.nodeData.roadmapID,
                'roadmaps',
                'nodes',
                this.nodeData.id,
                {
                    onUpdate: this.handleRealTimeUpdate.bind(this),
                    // onDelete: this.handleRealTimeDelete.bind(this),
                }
            );
            this.isListening = true;
        }
        handleRealTimeUpdate(data) {

            console.log('[REALTIME] Zmiana node:', data);

            if(typeof data.timerSeconds === 'number') {
                this.timerSeconds = data.timerSeconds ;
                this.updateTimerDisplay();
            }
            //uruchamiam licznik w zaleznosci od flagi
            if(typeof data.isRunning ==='boolean') {
                const currentlyRunning = this.nodeData.isRunning;
                const incomingRunning = data.isRunning;

                if(incomingRunning && !currentlyRunning) {
                    this.startTimer();
                } else if (!incomingRunning && currentlyRunning) {
                    this.pauseTimer();
                }
                this.nodeData.isRunning = incomingRunning;
            }
            //pokazuje odpowiedni przycisk w zależnosci od flagi
            if(typeof data.paused === 'boolean') {
                if(data.paused) {
                    showElement(this.ui.continueBtn);
                    hideElement(this.ui.pauseBtn);
                } else {
                    showElement(this.ui.pauseBtn);
                    hideElement(this.ui.continueBtn);
                }
            }
            
        }
    setupPause(){
        const continueBtn = this.ui.continueBtn;
        const pauseBtn = this.ui.pauseBtn;
        pauseBtn?.addEventListener('click', () => {
            this.pauseTimer();
            showElement(continueBtn);
            hideElement(pauseBtn);
            
        });
    }  

       

    setupContinue(){
        const pauseBtn = this.ui.pauseBtn;
        const continueBtn = this.ui.continueBtn;
        continueBtn?.addEventListener('click', () => {
            this.startTimer();
            showElement(pauseBtn);
            hideElement(continueBtn);
        });
    } 
    togglePauseAndContinue(){
        const pauseBtn = this.ui.pauseBtn;
        const continueBtn = this.ui.continueBtn;
        if(pauseBtn?.classList.contains('hidden')) {
            this.setupContinue();
        }

    }

            

            
       
     
       
       

       
      
        
        
        
       

      
       
       
        
        


            

            
    
   
            
            
            
            
            
        
               
                
               
            
        
        
        
        
        
        

    
     
        
        
        
        
        
        
        
       
}

        
            
export class NodeElement {
    constructor(fullNodeData) {
        this.nodeData = fullNodeData
        
    }
   //Metoda renderowania elementów roadmapy
    render(){
        const ulID = this.nodeData.roadmapID;
        const rightUl = document.getElementById(ulID);
        const title= this.nodeData.title;
        const subUlID =`sub-${ulID}` //<-tworze id dla pojemnika na subtaski
        const li = document.createElement('li');
        li.classList.add('roadmap-node');
        
        if(this.nodeData.id){
            li.dataset.id = this.nodeData.id //<-nadaje id takie jak ten z firebase
        }
        //tworze html noda
        li.innerHTML =`
        
          
          <div class="title-roudmap">
              <span class="node-text">${title}</span>
              <button class="node-acc-btn " id="roadmap-accordeon-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                      stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
              </button>
              </div>
        
            
              
            <div class="node-btn-container">
                <button class="stop-btn roud-btns" aria-label="stop timer">Zatrzymaj
                    <svg class="roud-btns-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
                    </svg>
                </button>
                  <div class="timer">Czas
                    <small class="node-time">0:00</small>
                </div>
                  <button class="play-btn roud-btns" aria-label="start timer">Rozpocznij
                    <svg  class="roud-btns-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                    </svg>
                </button>
            </div>
                
            <div class="progress-container">
                <span class="progress-text">20%</span>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                
            </div>
    
            <ul id ="${subUlID}" class="subtask-list hidden">
                    
                </ul>
            `;
        
        rightUl.appendChild(li); // <-dodaje do odpowiedniego UL
        
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
        }
    }
}

        
            
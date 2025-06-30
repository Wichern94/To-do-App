import { FormErrors } from '../uiErrorHandler.js';
export class RoadmapSelector {
    constructor({
        titleContainerID,
        newMapBtnID,
        setRoadmapContainerID,
        setRoadmapFormID,
        setInputTitleID,
        setRoadmapSubmitBtnID,
        abandonRoadmapSubmitBtnID,
        onSubmit = null,
        onDelete = null,
        ulContainerID,
    })
    {
        this.elements = {
            titleContainer: document.getElementById(titleContainerID),
            newMapBtn: document.getElementById(newMapBtnID),
            setRoadmapContainer: document.getElementById(setRoadmapContainerID),
            setRoadmapForm: document.getElementById(setRoadmapFormID),
            setInputTitle: document.getElementById(setInputTitleID),
            setRoadmapSubmitBtn: document.getElementById(setRoadmapSubmitBtnID),
            abandonRoadmapSubmitBtn: document.getElementById(abandonRoadmapSubmitBtnID),
            ulContainer: document.getElementById(ulContainerID)
        };
        this.listeners = [
            { el: 'newMapBtn', event: 'click', handler: this.showAddRoadmap.bind(this) },
            { el: 'abandonRoadmapSubmitBtn', event: 'click', handler: this.hideAddRoadmap.bind(this) },
            { el: 'setRoadmapSubmitBtn', event: 'click', handler: this.handleSubmit.bind(this) },
            { el: 'setRoadmapForm', event: 'click', handler: this.handleClearError.bind(this) },
            { el: 'ulContainer', event: 'click', handler: this.handleDelete.bind(this)},
            
            
            
        ];
        this.roadmaps = [];
        this.FormErr = new FormErrors('create-map-form');
        this.onSubmit = onSubmit;
        this.onDelete = onDelete;
         }  
        activate() {
            this.listeners.forEach(({ el,event, handler}) => {
                this.elements[el]?.addEventListener(event,handler);
            });
        }
           
        deactivate() {
            this.listeners.forEach(({ el,event,handler}) => {
                this.elements[el]?.removeEventListener(event, handler)
            })
        };

    
    showAddRoadmap(){
        
        this.elements.setRoadmapContainer?.classList.remove('hidden')
    }
    hideAddRoadmap() {
        this.elements.setRoadmapContainer?.classList.add('hidden');
        this.FormErr.clearAllErrors()
        this.elements.setInputTitle.value = '';
    }
    handleSubmit(e) {
            e.preventDefault()
            const nameInputData = this.elements.setInputTitle.value.trim()
            if(!nameInputData) {
                this.FormErr.showError('create-map-title','Nazwij mapę!');
                return
            }
            if(this.roadmaps.some(r => r.title === nameInputData)) {
                this.FormErr.showError('create-map-title','Nazwa juz instnieje!');
                return;
            }
            
            
           
            const roadData = {
                title: nameInputData,
                
                
            }
            this.roadmaps.push(roadData);
                
            if(typeof this.onSubmit === 'function') this.onSubmit(roadData);
            
            this.hideAddRoadmap()
            return roadData
        } 
     handleClearError(e){
            this.FormErr.clearError(e.target.name);
        }
    createRoadmapLi(data){
        const li = document.createElement('li');
        li.classList.add('roadmap-list-item');
         if(data.id){
             li.dataset.id = data.id
         }
        li.innerHTML =  
            `<p class="roadmap-list-item-text">${data.title}</p>
                    <div class="list-bttns">
                         <button  class="delete-road-btn roud-list-btns" aria-label="delete task">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                        <button class="enter-road-btn roud-list-btns">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                            </svg>

                        </button>
                    </div>`
            this.elements.ulContainer.appendChild(li)
            this.checkRoudmaps();
        };
            
            
            
    loadRoadmapList(roadmaps){
        if(!Array.isArray(roadmaps)) return;

        roadmaps.forEach(road => {
            this.createRoadmapLi(road);

        })
    }; 
    handleDelete(e) {
        const deleteBtn = e.target.closest('.delete-road-btn');
        if(!deleteBtn) return;

        const li = deleteBtn.closest('.roadmap-list-item');
        const roadmapId = li?.dataset.id;
        if(!roadmapId) return 
        

        if(typeof this.onDelete === 'function') {
            this.onDelete(roadmapId);
            
        }
        

    } 
    checkRoudmaps(){
        if (this.elements.ulContainer.querySelector('li')) {
                console.log('tytul nagłowku:',this.elements.titleContainer);
                
                this.elements.titleContainer.textContent = 'Twoje Roadmapy:';
            } else {
               this.elements.titleContainer.textContent = 'Nie masz Roadmap!'; 
             }
    }  
            
            
            
            
        
        
        
}
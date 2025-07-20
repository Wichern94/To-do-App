export class AnimationManager{
    constructor(plumbManager) {
        this.plumbManager = plumbManager;
    }

    launchConfetti(container,originX,originY){
        if(container.querySelector('canvas.confetti-canvas')) return;
        
        const canvas = document.createElement('canvas');
        canvas.classList.add('confetti-canvas');

            Object.assign(canvas.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: '9999',
            });
                
        container.appendChild(canvas);
        const confettiInstance = confetti.create(canvas, { 
            resize: true,
            useWorker:true });

        confettiInstance({
            particleCount: 150,
            spread:70,
            origin: {x: originX, y:originY},
            colors: [
                '#6bcdce','#5ef3a3',
                '#ff5f5f','#ffc857',
                '#62c76b','#e3b341',
                '#db5656'],
            });

            setTimeout(() => {
                canvas.remove();
            },5000);
        }
    
    bounceBtn(element){
        if(!element)  {
            console.log('brak przycisku do animacji')
            return;
        }

        anime({
            targets:element,
            translateY: [
                {value: -5, duration: 300},
                {value: 0, duration: 300},
            ],
            loop:true,
            easing:'easeInOutSine',
        });

    }
    buttonOneAnimation(element, animation){
        if(!element) return;

        requestAnimationFrame(()=>{
            element.classList.remove(`animate__${animation}`); // reset

            //tzw. reflow – czyli przeglądarka musi natychmiast obliczyć i zaktualizować layout strony.
            void element.offsetWidth;  //void -„nie interesuje mnie wartość, chcę tylko efekt uboczny”
            element.classList.add('animate__animated', `animate__${animation}`);

            const handleAnimationEnd = () => {
                element.classList.remove('animate__animated',`animate__${animation}`);
                element.removeEventListener('animationend',handleAnimationEnd);
            };
            element.addEventListener('animationend',handleAnimationEnd);
        });
    }
    toggleAccordeon(btn,contentBox, li){
            if(!btn || !contentBox ||!li) {
                console.log('brakdanych do akordeonu');
                return ;
            }
            const wasHidden = contentBox.classList.contains('hidden');
            const defaultLiHeight = li.offsetHeight;
            
            if(wasHidden){
               contentBox.classList.remove('hidden');
               this.plumbManager.jsPlumbInstance.repaintEverything() 
           
               requestAnimationFrame(() => {
                   const liEndHeight = li.scrollHeight;
                   li.style.height =`${defaultLiHeight}px`;
            
            
                requestAnimationFrame(() => {
                    li.style.transition = 'height .3s ease'
                    li.style.height = `${liEndHeight}px`
                

                    const cleanHeight = ()=>{
                        li.style.height = '';
                        li.style.transition = '';
                        li.removeEventListener('transitionend', cleanHeight);
                    };

                    li.addEventListener('transitionend', cleanHeight);
                });
            });

        } else{
            const liEndHeight = li.scrollHeight
            li.style.height = `${liEndHeight}px`;
            
            requestAnimationFrame(() => {
                li.style.transition = 'height .3s ease';
                li.style.height = `${li.offsetHeight - contentBox.scrollHeight}px`;
                
                const interval = setInterval(() => {
                    this.plumbManager?.jsPlumbInstance?.revalidate(li);
                    this.plumbManager?.jsPlumbInstance?.repaintEverything();
                }, 10); // co 10ms przez 300ms
               
                setTimeout(() => {
                    clearInterval(interval);
                }, 300); // zatrzymaj po 300ms
                

                                    
                const cleanHeight = () => {
                    contentBox.classList.add('hidden');
                    
                    li.style.height = '';
                    li.style.transition = '';
                    li.removeEventListener('transitionend', cleanHeight);
                };
                li.addEventListener('transitionend', cleanHeight);
            });
        }      
        
        void btn.offsetWidth;
        void contentBox.offsetWidth;

        btn?.classList.add('animate__animated','animate__flip');
        contentBox?.classList.add('animate__animated','animate__tada');

        const cleanClasses = () => {
            
            btn.classList.remove('animate__flip','animate__animated');
            contentBox.classList.remove('animate__tada','animate__animated');
            btn.removeEventListener('animationend',cleanClasses);
        };
        btn.addEventListener('animationend', cleanClasses);
    }

    plumbLineAnimation(sourceID,targetID, onFinish){
        
        const connections = this.plumbManager.jsPlumbInstance.getConnections();
        console.log('połączenia to:',connections);

        const targetConnection = connections.find(
            conn =>
            conn.sourceId === sourceID &&
            conn.targetId === targetID
            );

         if(!targetConnection) {
            console.log('nie znaleziono połączen!');
            return;
        }
            this.plumbManager?.jsPlumbInstance?.repaintEverything();
            const path = targetConnection.canvas?.querySelector('path');
            
            
            const length = path.getTotalLength()
            
            const existing = path.parentNode.querySelector('path[data-cloned="true"]');
            if (existing) {
                console.log('brak existing!');
                return;
            }

            const clonedPath = path.cloneNode();

            clonedPath.dataset.cloned = "true";
            clonedPath.style.stroke ='#9AEFFF';
            clonedPath.style.strokeDasharray = `20 ${length -20 } `;
            clonedPath.style.strokeDashoffset = `${length}`;
            
            clonedPath.style.strokeWidth = '2.5px';
            clonedPath.style.filter = 'drop-shadow(0 0 10px #A0FFF7)';
           
               const animation = clonedPath.animate([
                    { strokeDashoffset: 0 },
                    { strokeDashoffset: `-${length}` }  
                    ], {
                    duration: 1000,
                    iterations: 1,
                    easing: 'linear'
                    });

                path.parentNode.appendChild(clonedPath);

                animation.onfinish = () => {
                    if(clonedPath && clonedPath.parentNode) {
                        clonedPath.remove();
                    }
                    console.log('animacja zakonczona, i ścieżka usunięta!');
                    if(typeof onFinish === 'function') {
                        onFinish();
                    }
                };
                    

            }


    removeElementAnimation(element, animation,callback){
        if(!element) return;

        requestAnimationFrame(()=>{
            element.classList.remove(`animate__${animation}`); // reset

            //tzw. reflow – czyli przeglądarka musi natychmiast obliczyć i zaktualizować layout strony.
            void element.offsetWidth;  //void -„nie interesuje mnie wartość, chcę tylko efekt uboczny”
            element.classList.add('animate__animated', `animate__${animation}`);

            const handleAnimationEnd = () => {
                element.classList.remove('animate__animated',`animate__${animation}`);
                element.removeEventListener('animationend',handleAnimationEnd);

                if(typeof callback === 'function') {
                    callback();
                }
            };

            element.addEventListener('animationend',handleAnimationEnd);
        });
    }
            

           
           
             
            
    
       
        
                    
                       
                   
                    
                     
                 
                
                

                    
                    

              
                    



                
            





       


}
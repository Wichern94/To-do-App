import { showElement,hideElement,toggleElement } from "../utils/helper.js";
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
   async toggleAccordeon(btn,contentBox, li){
            if(!btn || !contentBox || !li) {
                console.log('brakdanych do akordeonu');
                return ;
            }
            const wasHidden = contentBox.classList.contains('hidden');
           
            if(wasHidden){
                const heightStart = li.offsetHeight;
                const widthStart = li.offsetWidth;
            
               showElement(contentBox);
               this.plumbManager.jsPlumbInstance.repaintEverything()
               
               requestAnimationFrame(() =>{

                const widthEnd = li.scrollWidth;
                const heightEnd = li.scrollHeight;
                
                li.style.transition = 'width .3s ,height .3s ';
                li.style.width = `${widthStart}px`;
                li.style.height = `${heightStart}px`;
             
                requestAnimationFrame(() => {
                    li.style.width = `${widthEnd}px`;
                    li.style.height = `${heightEnd}px`;
                    
                    const interval = setInterval(() => {
                    this.plumbManager?.jsPlumbInstance?.revalidate(li);
                    this.plumbManager?.jsPlumbInstance?.repaintEverything();
                    }, 10); // co 10ms przez 300ms
                                   
                    setTimeout(() => {
                        clearInterval(interval);
                    }, 300); // zatrzymaj po 300ms
                
                    const cleanHeight = ()=>{
                        li.style.height = '';
                        li.style.width = '';
                        li.style.transition = '';
                        li.removeEventListener('transitionend', cleanHeight);
                    };

                    li.addEventListener('transitionend', cleanHeight);
                });
            });
                    

                
                        
                        
                    
                    
    
                    
                   
                    
                

        } else{
            const widthStart = li.offsetWidth;
            const heightStart = li.offsetHeight;
            await this.hideAnimation(contentBox,'fadeOut','.2s')
            
            
            requestAnimationFrame(() => {
                const widthEnd = li.scrollWidth;
                const heightEnd = li.scrollHeight;

                li.style.transition = 'width .3s ,height .3s ';
                li.style.height = `${heightStart}px`;
                li.style.width = `${widthStart}px`;
                requestAnimationFrame(()=>{
                    li.style.width = `${widthEnd}px`;
                    li.style.height =`${heightEnd}px`;
                
                
                const interval = setInterval(() => {
                    this.plumbManager?.jsPlumbInstance?.revalidate(li);
                    this.plumbManager?.jsPlumbInstance?.repaintEverything();
                }, 10); // co 10ms przez 300ms
               
                setTimeout(() => {
                    clearInterval(interval);
                }, 300); // zatrzymaj po 300ms
                

                                    
                const clean = () => {
                   
                    
                    li.style.width = ''
                    li.style.height = '';
                    li.style.transition = '';
                    li.removeEventListener('transitionend', clean);
                };
                li.addEventListener('transitionend', clean);
            });
        });
        }      
        
        void btn.offsetWidth;
        void contentBox.offsetWidth;

        btn?.classList.add('animate__animated','animate__flip');
        contentBox?.classList.add('animate__animated','animate__tada');

        const cleanClasses = () => {
            this.plumbManager?.jsPlumbInstance?.repaintEverything();
            btn.classList.remove('animate__flip','animate__animated');
            contentBox.classList.remove('animate__tada','animate__animated');
            btn.removeEventListener('animationend',cleanClasses);
        };
        btn.addEventListener('animationend', cleanClasses);
    }

      async elementToggle(elOne,elSecond){
          if(!elOne || !elSecond) throw new Error('Nie znaleziono Elementów!');

          const isHidden = elOne.classList.contains('hidden');
       

           
            if(isHidden) {
                void elOne.offsetWidth;
                void elSecond.offsetWidth;
                // showElement(elOne);
                // showElement(elSecond);

               await this.showAnimation(elOne, 'fadeIn','.4s');
               await this.showAnimation(elSecond,'fadeIn','.1s'); 

            } else {
                void elOne.offsetWidth;
                void elSecond.offsetWidth;
                // hideElement(elSecond)
                // hideElement(elSecond)

               await this.hideAnimation(elSecond,'fadeOut','.1s'); 
               await this.hideAnimation(elOne, 'fadeOut','.4s');
            }
            return 'Animacja zakonczona';
        }
                

              


              
       
        
       
                    
               
            
             
            




    plumbLineAnimation(sourceID,targetID){
        return new Promise ((resolve,reject) => {
        try{
            
            const connections = this.plumbManager.jsPlumbInstance.getConnections();
            console.log('połączenia to:',connections);
            
            const targetConnection = connections.find(
                conn =>
                conn.sourceId === sourceID &&
                conn.targetId === targetID
                );

            if(!targetConnection) {
                throw new Error('nie znaleziono połączen!');
            }
                    
            this.plumbManager?.jsPlumbInstance?.repaintEverything();
            const path = targetConnection.canvas?.querySelector('path');
            

            const length = path.getTotalLength()
                
            const existing = path.parentNode.querySelector('path[data-cloned="true"]');
            if (existing) {
                throw new Error('Animacja juz instnieje, nie mozna dodac drugiej!');
            }
                
             path.style.strokeDasharray = `${length}`;
             path.style.strokeDashoffset = '0';

            const clonedPath = path.cloneNode();
            clonedPath.dataset.cloned = "true";
            clonedPath.style.stroke ='#9AEFFF';
            clonedPath.style.strokeDasharray = `20 ${length -20 } `;
            clonedPath.style.strokeDashoffset = `${length}`;
            
            clonedPath.style.strokeWidth = '2.5px';
            clonedPath.style.filter = 'drop-shadow(0 0 10px #A0FFF7)';

            path.parentNode.appendChild(clonedPath);
            clonedPath.getBoundingClientRect();
            const animation = clonedPath.animate([
                    { strokeDashoffset: 0 },
                    { strokeDashoffset: `-${length}` }  
                    ], {
                    duration: 1200,
                    iterations: 1,
                    easing: 'linear'
                    });
           
            
            animation.onfinish = () => {
                
                
               
                    clonedPath?.remove();
                    console.log('czy jest usuniety:?',clonedPath);
                    
                }
            


            requestAnimationFrame(() => {
            const animationTwo = path.animate([
                { strokeDashoffset: `0` },
                { strokeDashoffset: `${length}` }  
                ], {
                duration: 1000,
                iterations: 1,
                easing: 'ease-in',
                fill:'forwards',
                });  
            

            animationTwo.onfinish = () => {
                path.style.strokeDashoffset = length;
                path.style.strokeDasharray = length;
                this.plumbManager.jsPlumbInstance.deleteConnection(targetConnection);
                resolve('Animacja zakończona poprawnie');
                const connectionsAfter = this.plumbManager.jsPlumbInstance.getConnections();
                console.log('After połączenia to:',connectionsAfter);
            };
           });     
            
            } catch (err) {
                reject(err);
            }   
        });    
    }
                             
                
           

           
            
            
                
                

                
            
            
                    
                    
                    
                

                
                    
                    
                    
                    
                    
                    


                        
                        
                    
                    



    removeElementAnimation(element, animation ){
        return new Promise((resolve,reject) => {
            try{
                if(!element) {
                    throw new Error('brakuje elementów! element jest:',element);
                }

            requestAnimationFrame(()=>{
                element.classList.remove(`animate__${animation}`); // reset
                
                //tzw. reflow – czyli przeglądarka musi natychmiast obliczyć i zaktualizować layout strony.
                void element.offsetWidth;  //void -„nie interesuje mnie wartość, chcę tylko efekt uboczny”
                 
                element.classList.add('animate__animated', `animate__${animation}`);
                
                const handleAnimationEnd = () => {
                   element.classList.remove('animate__animated',`animate__${animation}`);
                   element.removeEventListener('animationend',handleAnimationEnd);
                   console.log('Dodaję klasy:', `animate__animated animate__${animation}`);
                   resolve('Animcja node ok');
           
                };
                element.addEventListener('animationend',handleAnimationEnd);
                
            });
                    
            } catch(err) {
                reject(err);
            }
        });
    }


    slideUpElement(element){
        return new Promise((resolve,reject) => {
            try{
                if(!element) {
                    throw new Error('brakuje elementów do animacji! element jest:',element);
                }
                const height = element.offsetHeight;
                
                
                if (element.classList.contains('hidden')) {
                    showElement(element);
                    
                }
                 const interval = setInterval(() => {
                    this.plumbManager?.jsPlumbInstance?.revalidate(element);
                    this.plumbManager?.jsPlumbInstance?.repaintEverything();
                }, 10); // co 10ms przez 300ms
               
                setTimeout(() => {
                    clearInterval(interval);
                }, 1500); // zatrzymaj po 300ms
                   
                requestAnimationFrame(()=>{
                    anime({
                        targets:element,
                        translateY: `-${height}px`,
                        duration: 1500,
                        easing:'easeInOutSine',
                        complete: () => resolve('Animation ok')
                    });
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    addElementAnimation(element, animation,duration ){
        return new Promise((resolve,reject) => {
            try{
                if(!element) {
                    throw new Error('brakuje elementów! element jest:',element);
                }
            
            requestAnimationFrame(()=>{
                element.classList.remove(`animate__${animation}`); // reset
                
                
                void element.offsetWidth;
               
                element.style.setProperty('--animate-duration', `${duration}`);
                element.classList.add('animate__animated', `animate__${animation}`);
           
              
                const handleAnimationEnd = () => {
                   element.classList.remove('animate__animated',`animate__${animation}`);
                   element.style.removeProperty('--animate-duration');
                   element.removeEventListener('animationend',handleAnimationEnd);
                   console.log('Dodaję klasy:', `animate__animated animate__${animation}`);
                   resolve('Animcja node ok');
           
                };
                element.addEventListener('animationend',handleAnimationEnd);
                
            });
                    
            } catch(err) {
                reject(err);
            }
        });
    }


     widthAndHeight(element,referenceElement){
        return new Promise((resolve,reject) => {
            try{
                if(!element) {
                    throw new Error('brakuje elementów do animacji! element jest:',element);
                }
                
                if (element.classList.contains('hidden')) {
                    showElement(element);
                }
                const heightStart = element.offsetHeight;
                const widthStart = element.offsetWidth;

                const heightEnd = referenceElement.h;
                const widthEnd = referenceElement.w;
                
                element.style.width = `${widthStart}px`
                element.style.height = `${heightStart}px`
                console.log('start', widthStart, heightStart);
                console.log('end', widthEnd, heightEnd);
                requestAnimationFrame(()=>{
                    
                    const interval = setInterval(() => {
                        this.plumbManager?.jsPlumbInstance?.revalidate(element);
                        this.plumbManager?.jsPlumbInstance?.repaintEverything();
                    }, 10); // co 10ms przez 300ms
                   
                    setTimeout(() => {
                        clearInterval(interval);
                    }, 1800); // zatrzymaj po 300ms
                    element.style.transition = 'width 1.5s, height 1.5s';
                    
                    requestAnimationFrame(()=>{
                       element.style.width = `${widthEnd}px`;
                       element.style.height = `${heightEnd}px`;


                       const clean = ()=>{
                            console.log('uruchomiono clean odwidthandheight!');
                            
                            element.style.height = '';
                            element.style.width = '';
                            element.style.transition = '';
                            resolve('animation ok!')
                            element.removeEventListener('transitionend', clean);
                    };

                    element.addEventListener('transitionend', clean);
                    });
            });
                
                
                    
               
                   
                   
            } catch (err) {
                reject(err);
            }
        });
    }

    showBtns(element,duration ){
        return new Promise((resolve,reject) => {
            try{
                if(!element) {
                    throw new Error('brakuje elementów! element jest:',element);
                }

            requestAnimationFrame(()=>{
                element.classList.remove(`animate__fadeIn`); // reset 
                
                
                void element.offsetWidth;

               
                element.style.setProperty('--animate-duration', `${duration}`);
                showElement(element);
                
                element.classList.add('animate__animated', `animate__fadeIn`);
                
           
              
                const handleAnimationEnd = () => {
                   element.classList.remove('animate__animated',`animate__fadeIn`);
                   element.style.removeProperty('--animate-duration');
                   element.removeEventListener('animationend',handleAnimationEnd);
                   console.log('Dodaję klasy:', `animate__animated animate__fadeIn`);
                   resolve('Animcja node ok');
           
                };
                element.addEventListener('animationend',handleAnimationEnd);
                
            });
                    
            } catch(err) {
                reject(err);
            }
        });
    }
    hideBtns(element,duration ){
        return new Promise((resolve,reject) => {
            try{
                if(!element) {
                    throw new Error('brakuje elementów! element jest:',element);
                }

            requestAnimationFrame(()=>{
                element.classList.remove(`animate__fadeOut`); // reset 
                
                
                void element.offsetWidth;

               
                element.style.setProperty('--animate-duration', `${duration}`);
                
                element.classList.add('animate__animated', `animate__fadeOut`);
                
           
              
                const handleAnimationEnd = () => {
                   element.classList.remove('animate__animated',`animate__fadeOut`);
                   element.style.removeProperty('--animate-duration');
                   hideElement(element);
                   
                   element.removeEventListener('animationend',handleAnimationEnd);
                   console.log('Dodaję klasy:', `animate__animated animate__fadeOut`);
                   resolve('Animcja node ok');
           
                };
                element.addEventListener('animationend',handleAnimationEnd);
                
            });
                    
            } catch(err) {
                reject(err);
            }
        });
    }

    showAnimation(element, animation,duration ){
        return new Promise((resolve,reject) => {
            try{
                if(!element) {
                    throw new Error('brakuje elementów! element jest:',element);
                }

            requestAnimationFrame(()=>{

                element.classList.remove(`animate__${animation}`); // reset
                void element.offsetWidth;
                
                
                
                showElement(element);
                element.style.setProperty('--animate-duration', `${duration}`);
                element.classList.add('animate__animated', `animate__${animation}`);
           
              
                const handleAnimationEnd = () => {
                   element.classList.remove('animate__animated',`animate__${animation}`);
                   element.style.removeProperty('--animate-duration');
                   element.removeEventListener('animationend',handleAnimationEnd);
                   console.log('Dodaję klasy:', `animate__animated animate__${animation}`);
                   resolve('animacja ok!')
                };
                element.addEventListener('animationend',handleAnimationEnd);
            });
        }catch(error) {
            reject(error)
        }
    });
}

     hideAnimation(element, animation,duration ){
        return new Promise((resolve,reject) => {
            try{
                if(!element) {
                    throw new Error('brakuje elementów! element jest:',element);
                }

            requestAnimationFrame(()=>{

                element.classList.remove(`animate__${animation}`); // reset
                void element.offsetWidth;
                
                
               
                element.style.setProperty('--animate-duration', `${duration}`);
                element.classList.add('animate__animated', `animate__${animation}`);
           
              
                const handleAnimationEnd = () => {
                    element.classList.remove('animate__animated',`animate__${animation}`);
                    element.style.removeProperty('--animate-duration');
                    
                    hideElement(element);
                    element.removeEventListener('animationend',handleAnimationEnd);
                    console.log('Dodaję klasy:', `animate__animated animate__${animation}`);
                    resolve('animacja ok!');
                };
                element.addEventListener('animationend',handleAnimationEnd);
            });
        }catch(error) {
            reject(error)
        }
    });
}
                   
           

     blurInElement(element, ){
        return new Promise((resolve,reject) => {
            try{
                if(!element) {
                    throw new Error('brakuje elementów! element jest:',element);
                }
                element.style.backdropFilter = 'blur(0px)'
                void element.offsetHeight
                const blurState = {value: 0};

                
                requestAnimationFrame(()=>{
                    element.classList.remove('hidden');
                    anime({
                        targets:blurState,
                        value: 10,
                        duration: 500,
                        easing:'easeInOutQuad',
                        update: function() {
                         element.style.backdropFilter = `blur(${blurState.value}px)`
                         element.style.webkitbackdropFilter = `blur(${blurState.value}px)`
                        },
                        complete: () => resolve('Animation ok')
                        
                    });
                });
            }catch(error) {
                reject(error)
            }
        });
    }
        
     blurOutElement(element, ){
        return new Promise((resolve,reject) => {
            try{
                if(!element) {
                    throw new Error('brakuje elementów! element jest:',element);
                }
                element.style.backdropFilter = 'blur(10px)'
                void element.offsetHeight
                const blurState = {value: 10};

                
                requestAnimationFrame(()=>{
                    element.classList.remove('hidden');
                    anime({
                        targets:blurState,
                        value: 0,
                        duration: 500,
                        easing:'easeInOutQuad',
                        update: function() {
                         element.style.backdropFilter = `blur(${blurState.value}px)`
                         element.style.webkitbackdropFilter = `blur(${blurState.value}px)`
                        },
                        complete: () =>{
                            element.classList.add('hidden');
                            resolve('Animation ok');
                        } 
                        
                    });
                });
            }catch(error) {
                reject(error)
            }
        });
    }
                    
            
        

    
                        


                            
                    





                           
                       
                       
                       
                

        
                
                    
        
       
            


          
        
       
       
    }

            

           
           
             
            
    
       
        
                    
                       
                   
                    
                     
                 
                
                

                    
                    

              
                    



                
            





       



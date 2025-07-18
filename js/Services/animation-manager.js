export class AnimationManager{
    constructor() {
        
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
    buttonOneAnimation(element){
        if(!element) return;

        element.classList.remove('animate__rubberBand'); // reset
       

        //tzw. reflow – czyli przeglądarka musi natychmiast obliczyć i zaktualizować layout strony.
        void element.offsetWidth;  //void -„nie interesuje mnie wartość, chcę tylko efekt uboczny”
        element.classList.add('animate__animated', 'animate__rubberBand');

        const handleAnimationEnd = () => {
            element.classList.remove('animate__animated','animate__rubberBand');
            element.removeEventListener('animationend',handleAnimationEnd);
        };

        element.addEventListener('animationend',handleAnimationEnd);
    }
    toggleAccordeon(btn,contentBox, li){
            if(!btn || !contentBox ||!li) {
                console.log('brakdanych do akordeonu');
                
                return ;
            }
            const defaultLiHeight = li.offsetHeight;
            contentBox.classList.toggle('hidden');
                
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
                
                    
                     
                 
                
                void btn.offsetWidth;
                void contentBox.offsetWidth;

                btn?.classList.add('animate__animated','animate__flip');
                contentBox?.classList.add('animate__animated','animate__pulse');

                const cleanClasses = () => {
                    
                    btn.classList.remove('animate__flip','animate__animated');
                    contentBox.classList.remove('animate__pulse','animate__animated');
                    btn.removeEventListener('animationend',cleanClasses);
                };
               
                btn.addEventListener('animationend', cleanClasses);
                
            }
                

                    
                    

              
                    



                
            





       


}
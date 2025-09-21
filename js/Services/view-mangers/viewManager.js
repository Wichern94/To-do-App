export class ViewManager {
    constructor() {
        // pobieramy wszystkie elementy Widoku
        this.views = document.querySelectorAll('.apk-look'); // <-widoki: logowanie/rejestracja/forget/apka
        this.modes = document.querySelectorAll('.modes') // <- tryby do przełączania karuzelą
        this.dots = document.querySelectorAll('.dot');
    }
    //1. WIDOKI--------------------------------------------------------------------

    // ukrywamy widoki
    hideAllViews() {
        this.views.forEach(view => view.classList.add('hidden'));
    }
    hideOneView(id){
        const  apkView = document.getElementById(id)
        apkView.classList.add('hidden');
    }
    // pokazujemy widoki po ID
    showView(viewId) {
        this.hideAllViews();
        const view = document.getElementById(viewId);
        if(view) {
            view.classList.remove('hidden');
            document.dispatchEvent(new CustomEvent('view:changed'));
        } else {
            console.error(`View with id "${viewId}" not found.`)
        }
    }
    //2.TRYBY---------------------------------------------------------------------

    // ukrywamy wszytskie tryby
    hideAllModes() {
        this.modes.forEach(mode => mode.classList.add('hidden'));
    }
    // ukrywamy jeden Tryb
    hideOnemode(id){
        const  apkMode = document.getElementById(id)
        apkMode.classList.add('hidden');
    }
    //Pokazujemy tryb po id
     showMode(sectionId,indicatorId) {
        this.hideAllModes();
        const mode = document.getElementById(sectionId);
        if(mode) {
            mode.classList.remove('hidden');
            // document.dispatchEvent(new CustomEvent('mode:changed'));
        } else {
            console.error(`Mode with id "${sectionId}" not found.`)
        }
        this.dots.forEach( dot => dot.classList.remove('active'));
        const rightDot = document.getElementById(indicatorId);
        if(rightDot) {
            rightDot.classList.add('active');
        } else {
            console.error(`Separator ${indicatorId} nie znaleziono`)
        }

    }
    
}
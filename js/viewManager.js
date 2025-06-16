export class ViewManager {
    constructor() {
        // pobieramy wszystkie elementy Widoku
        this.views = document.querySelectorAll('.apk-look'); // <-widoki: logowanie/rejestracja/forget/apka
        this.modes = document.querySelectorAll('.modes') // <- tryby do przełączania karuzelą
        
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
     showMode(modeId) {
        this.hideAllModes();
        const mode = document.getElementById(modeId);
        if(mode) {
            mode.classList.remove('hidden');
            document.dispatchEvent(new CustomEvent('mode:changed'));
        } else {
            console.error(`View with id "${modeId}" not found.`)
        }
    }
    //switch mode do karuzeli
    switchViewMode(modename) {
        const modeMap = {
            roudmap:'roadmap-view',
            list: 'li-sctn',
            calendar: 'calendar-view'
            

        };
        const indexMap = {
            roudmap:1,
            list: 0,
            calendar: 2

            
        };
        this.showMode(modeMap[modeName]);
        const activeDot = document.querySelector(`.dot[data-index="${indexMap[modeName]}"]`);
        activeDot?.classList.add('active');

    }
}
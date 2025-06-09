export class ViewManager {
    constructor() {
        // pobieramy wszystkie elementy Widoku
        this.views = document.querySelectorAll('.apk-look');
        
    }
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
}
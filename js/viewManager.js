export class ViewManager {
    constructor() {
        // pobieramy wszystkie elementy Widoku
        this.views = document.querySelectorAll('.screen');
    }
    // ukrywamy widoki
    hideAllViews() {
        this.views.forEach(view => view.classList.add('hidden'));
    }
    // pokazujemy widoki po ID
    showView(viewId) {
        this.hideAllViews();
        const view = document.getElementById(viewId);
        if(view) {
            view.classList.remove('hidden');
        } else {
            console.error(`View with id "${viewId}" not found.`)
        }
    }
}
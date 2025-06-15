export class GetCaruselPosition {
    constructor (caruselContainer,caruselItems) {
        this.container = document.getElementById(caruselContainer);
        this.items = document.querySelectorAll(caruselItems);
    }
}
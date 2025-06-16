export class GetCaruselPosition {
    constructor (caruselContainer,caruselItems) {
        this.container = document.getElementById(caruselContainer);
        this.items = document.querySelectorAll(caruselItems);
    }
    setCaruselToMiddle(){
        const itemWidth = this.items.forEach(item => {
            item.offsetWidth;
        })
    }
}
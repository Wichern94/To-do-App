export class GetCaruselPosition {
  constructor(caruselContainer, caruselItems) {
    this.container = document.getElementById(caruselContainer);
    this.items = Array.from(document.querySelectorAll(caruselItems));
    this.currentIndex = null;
    this.scrollTimeout = null;
    this.onViewChange = null;

    this.modeMap = {
      roadmap: {
        index: 0,
        sectionId: 'roadmap-view',
        indicatorId: 'sep-r',
        label: 'Roadmapa',
      },
      list: {
        index: 1,
        sectionId: 'list-view',
        indicatorId: 'sep-l',
        label: 'Lista',
      },
    };

    this.watchScroll();
  }
  setCaruselToMiddle() {
    const itemWidth = this.items[1]?.offsetWidth;
    const gap = 12;
    if (!itemWidth) return;
    const fullItemWidth = itemWidth + gap;
    const { index } = this.modeMap['list'];
    this.container.scrollLeft = fullItemWidth * index;
  }

  watchScroll() {
    this.container.addEventListener('scroll', () => {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        const itemWidth = this.items[1]?.offsetWidth;
        const gap = 12;
        const fullItemWidth = itemWidth + gap;
        const scrLeft = this.container.scrollLeft;
        this.currentIndex = Math.round(scrLeft / fullItemWidth);
        const mode = this.getViewKey();
        if (mode && typeof this.onViewChange === 'function') {
          this.onViewChange(mode);
        }
      }, 100);
    });
  }
  getIndex() {
    return this.currentIndex;
  }
  getViewKey() {
    const keyArr = Object.keys(this.modeMap);
    console.log(' tablica kluczy', keyArr);

    const viewKey = keyArr.find(
      (key) => this.modeMap[key].index === this.currentIndex
    );
    console.log('viewKey to:', viewKey);

    if (!viewKey) return null;

    const { sectionId, indicatorId } = this.modeMap[viewKey];

    console.log('sectionID to:', sectionId);
    console.log('indicatorID to:', indicatorId);

    return {
      viewKey,
      sectionId,
      indicatorId,
    };
  }
}

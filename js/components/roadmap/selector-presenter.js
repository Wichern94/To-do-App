import { FormValidator } from '../../Services/form-validator.js';
export class SelectorPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.renderedIds = new Set();
    this.isInitialPaint = true;
    this.SEEN_KEY = 'seenTaskIds';
  }
  async init() {
    this.view.activate();

    this.view.bind({
      onAdd: async (roadmapData) => {
        try {
          const isValid = FormValidator.validateOneInput(
            roadmapData.title,
            'create-map-title',
            this.view.formErrors
          );
          console.log(roadmapData);

          if (!isValid) return;

          const roadmaps = await this.model.createRoadmap(roadmapData);
          this._renderRoadmaps(roadmaps);
          this.view.handleCloseModal();
        } catch (err) {
          console.error('Add failed:', err);
        }
      },
      //       onToggle: async ({ id }) => {
      //         try {
      //           const order = [...this.view.ui.task.list.children].map(
      //             (li) => li.dataset.id
      //           );

      //           const removedIndex = order.indexOf(id);

      //           const promoteDomId = order[removedIndex + 1] ?? null;

      //           const oldEl = this.view.findItemEl(id);

      //           const tasks = await this.model.finishTask(id);
      //           const visible = tasks.filter((t) => !t.done);

      //           if (!oldEl) throw new Error('oldEl is not valid');
      //           await this.view.animateOldTask(oldEl);

      //           if (!promoteDomId) throw new Error('promoteDomId is not valid');
      //           const newEl = this.view.findItemEl(promoteDomId);
      //           await this.view.animateNewTask(newEl);

      //           this.renderedIds.delete(id);
      //           sessionStorage.setItem(
      //             this.SEEN_KEY,
      //             JSON.stringify([...this.renderedIds])
      //           );

      //           this._renderTasks(visible);
      //         } catch (err) {
      //           console.error('finish failed');
      //         }
      //       },
    });

    const roadmaps = await this.model.loadAll();
    const seenFromSession = JSON.parse(
      sessionStorage.getItem(this.SEEN_KEY) || '[]'
    );
    this.renderedIds = new Set(seenFromSession);

    roadmaps.forEach((t) => this.renderedIds.add(t.id));

    this._renderRoadmaps(roadmaps);
    this.isInitialPaint = false;
  }
  _renderRoadmaps(roadmaps) {
    const visible = roadmaps.filter((t) => !t.done);
    this.view.ui.selector.list.innerHTML = '';

    visible.forEach((r, i) => {
      const isNew = !this.renderedIds.has(r.id);
      this.view.render(r, { isNew, isInitial: this.isInitialPaint, index: i });
      this.renderedIds.add(r.id);
    });

    sessionStorage.setItem(
      this.SEEN_KEY,
      JSON.stringify([...this.renderedIds])
    );
  }
}

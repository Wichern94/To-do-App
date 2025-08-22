export class ListController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }
  async init() {
    this.view.activate();

    this.view.bind({
      onAdd: async ({ title, desc }) => {
        try {
          const tasks = await this.model.createTask({ title, desc });
          this._renderTasks(tasks);
        } catch (err) {
          console.error('Add failed:', err);
        }
      },
      onToggle: async ({ id }) => {
        try {
          const tasks = await this.model.finishTask(id);
          this._renderTasks(tasks);
        } catch (err) {
          console.error('finish failed');
        }
      },
    });
    const tasks = await this.model.loadAll();
    this._renderTasks(tasks);
  }
  _renderTasks(tasks) {
    const visible = tasks.filter((t) => !t.done);
    this.view.ui.task.list.innerHTML = '';
    visible.forEach((t) => this.view.render(t));
  }
}

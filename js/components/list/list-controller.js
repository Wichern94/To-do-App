export class ListController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }
  async init() {
    try {
      if (!this.view) throw new Error('Cant find ListView!');

      this.view.activate();
      this.view.bind({
        onAdd: async ({ title, desc }) => {
          const tasks = await this.model.createTask({ title, desc });
          this._renderTasks(tasks);
        },
        onToggle: async ({ id }) => {
          const tasks = await this.model.finishTask(id);
          this._renderTasks(tasks);
        },
      });
      await this.model
        .loadAll()
        .then(async (tasks) => await this._renderTasks(tasks));
    } catch (err) {
      console.error('Error while rendering List:', err);
    }
  }
  async _renderTasks(tasks) {
    const visible = tasks.filter((t) => !t.done);
    this.view.ui.task.list.innerHTML = '';
    visible.forEach((t) => view.render(t));
  }
}

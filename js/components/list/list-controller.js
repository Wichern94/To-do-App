export class ListControler {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.state = null;
    this.init();
  }
  init(model, view) {
    view.bind({
      onAdd: ({ title, desc }) => model.createTask({ title, desc }),

      onToggle: ({ id, finishedAt }) =>
        model.updateTask(id, { done: true, finishedAt }),
    });

    model.subscribe((tasks) => {
      const visible = tasks.filter((t) => !t.done);
      view.ui.task.list.innerHTML = '';
      visible.forEach((t) => view.render(t));
    });

    this.view.activate();
  }
}

export class ListModel {
  constructor(firestoreService, uid) {
    this.firestoreService = firestoreService;
    this.uid = uid;
    this.tasks = [];
  }
  init() {}
}

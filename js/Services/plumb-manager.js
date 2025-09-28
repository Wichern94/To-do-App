export class RoadmapPlumbManager {
  constructor(containerElement) {
    this.container = containerElement;
    this.jsPlumbInstance = jsPlumb.getInstance({
      connectionsDetachable: false,
      reattachConnections: false,
    });
    this.jsPlumbInstance.setContainer(this.container);
    this.connections = [];
    this._pending = null;

    this._onResize = () => this.repaitSchedule();
    this._onMqChange = () => this.repaitSchedule();

    window.addEventListener('resize', this._onResize, { passive: true });

    this._mq = window.matchMedia('(min-width: 768px)');
    this._mq.addEventListener('change', this._onMqChange);
  }

  connect(sourceId, targetId, anchors) {
    const connection = this.jsPlumbInstance.connect({
      source: sourceId,
      target: targetId,
      anchors: anchors,
      connector: [
        'Flowchart',
        {
          stub: [30, 30],
          cornerRadius: 10,
          alwaysRespectStubs: true,
        },
      ],
      paintStyle: {
        stroke: '#6BCDCE',
        strokeWidth: 1,
      },
      cssClass: 'connection-glow connection-animated',
      detachable: false,
      endpoint: [
        'Dot',
        {
          fill: '#6BCDCE',
          radius: 4,
          dragAllowed: false,
        },
      ],
    });

    this.connections.push(connection);
  }

  resetConnections() {
    this.connections.forEach((conn) =>
      this.jsPlumbInstance.deleteConnection(conn)
    );
    this.connections = [];
  }

  destroy() {
    this.jsPlumbInstance.deleteEveryConnection();
    this.jsPlumbInstance.deleteEveryEndpoint();
    this.jsPlumbInstance.reset();
    this.connections = [];
    window.removeEventListener('resize', this._onResize);
    this._mq?.removeEventListener('change', this._onMqChange);
    this._onResize = this._onMqChange = null;
  }
  repaitSchedule() {
    if (this._pending) return;
    this._pending = true;
    requestAnimationFrame(() => {
      setTimeout(() => {
        this.jsPlumbInstance.repaintEverything();
        this.jsPlumbInstance?.revalidate(this.container);
        this._pending = false;
      }, 80);
    });
  }
}

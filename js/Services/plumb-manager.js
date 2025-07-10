export class RoadmapPlumbManager {
  constructor(containerElement) {
    this.container = containerElement;
    this.jsPlumbInstance = jsPlumb;
    this.jsPlumbInstance.setContainer(this.container);
    this.connections = [];
}
   


  connect(sourceId, targetId) {
    const connection = this.jsPlumbInstance.connect({
      source: sourceId,
      target: targetId,
      anchors: ['Left','Right' ],
      connector: 'Flowchart',
      paintStyle: { stroke: '#6BCDCE', strokeWidth: 3 },
      endpoint: 'Dot',
      endpointStyle: { fill: '#6BCDCE', radius: 4 }
     
      
      
    });
    console.log('miejsca odczepienia to:',sourceId,targetId);
    this.connections.push(connection);
  }

  resetConnections() {
    this.connections.forEach(conn => this.jsPlumbInstance.deleteConnection(conn));
    this.connections = [];
  }

  destroy() {
    this.jsPlumbInstance.deleteEveryConnection();
    this.jsPlumbInstance.deleteEveryEndpoint();
    this.jsPlumbInstance.reset();
    this.connections = [];
  }
}

export class RoadmapPlumbManager {
  constructor(containerElement) {
    this.container = containerElement;
    this.jsPlumbInstance = jsPlumb;
    this.jsPlumbInstance.setContainer(this.container);
    this.connections = [];
}
   


  connect(sourceId, targetId ,anchors) {
    const connection = this.jsPlumbInstance.connect({
      source: sourceId,
      target: targetId,
      anchors: anchors,
      connector: ['Flowchart',{
        //stub:[30,30],
        cornerRadius:10,
        alwaysRespectStubs: true,
      }],
      paintStyle: { 
        stroke: '#6BCDCE',
        strokeWidth: 1,
      },
      cssClass:'connection-glow connection-animated',
        
      endpoint: 'Dot',
      endpointStyle: { fill: '#6BCDCE', radius: 4 },
      connectionsDetachable: false,
       reattachConnections: false,
     
      
      
    });
    
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

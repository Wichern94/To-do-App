export class NodeElement {
    constructor(fullNodeData) {
        this.nodeData = fullNodeData
        this.render()
    }
   
    render(){
        const ulID = this.nodeData.roadmapID;
        console.log('id ulki to',ulID);
        
        const rightUl = document.getElementById(ulID);
        console.log(rightUl);
        
    }
}
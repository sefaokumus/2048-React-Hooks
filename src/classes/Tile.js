class Tile {
    constructor(col,row,value,boxSize) {
        this.value = value || 0
        this.row = row 
        this.col=col
        this.boxSize =boxSize
        this.oldRow = -1
        this.oldCol = -1
        this.mergedInto=null
        this.deleteThrough=null
        this.id = '_' + Math.random().toString(36).substr(2, 9)
    }
    moveTo  (row, col) {
        this.oldRow = this.row;
        this.oldCol = this.col;
        this.row = row;
        this.col=col;
        
      };
      
    isNew () {
        return this.oldRow === -1 && !this.mergedInto;
    };
    

    cssClasses() {
        let classes='tile'
        
        classes+=' tile-' + Math.pow(2,this.value)

        if(this.isNew())
            classes+=' tile-new'
        
            
        if(this.mergedInto)
            classes += ' tile-merged'

        return classes;
    }
    getXYCoords(row,col,margin) {
        let x=((this.boxSize*col)+(margin*col));
        let y=((this.boxSize*row)+(margin*row));
        return {x,y}
    }
    inlineStyle(margin) {
        let {x,y}=this.getXYCoords(this.row,this.col,margin)
        let deleteCords;
        if(this.deleteThrough) {
            deleteCords=this.getXYCoords(this.deleteThrough.row,this.deleteThrough.col,margin)
    
        }
        return {
            width: this.boxSize+'px',
            height: this.boxSize+'px',
            left: this.deleteThrough? deleteCords.x +'px' : x,
            top: this.deleteThrough? deleteCords.y + 'px' : y,
      //      transform: this.deleteThrough? 'translate('+deleteCords.x+'px, '+deleteCords.y+'px)':'none',
            
        };
    }

    tileInnerStyle() {
        return {
            lineHeight: this.boxSize+'px',
            fontSize : Math.floor(this.boxSize/3)+'px'
        }
    }
}

export default Tile
  

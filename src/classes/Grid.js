import Tile from './Tile'


const getGridCacheOf=(row,col) => {
    return JSON.parse(localStorage.getItem(row + 'x' + col + '-grid'))
  }

class Grid {
    constructor(args) {
        const gridCacheOfx=getGridCacheOf(args.rowCount,args.colCount)||{}
        
        this.colCount=args.colCount
        this.rowCount=args.rowCount
        this.boxSize=args.boxSize
        this.score=gridCacheOfx.score? gridCacheOfx.score:0
        this.highscore=gridCacheOfx.highscore? gridCacheOfx.highscore:0
        this.tiles=gridCacheOfx.tiles? this.getTilesFromCache(gridCacheOfx.tiles):this.createEmptyMatrix(this.rowCount,this.colCount)
        this.history=gridCacheOfx.history? gridCacheOfx.history:[]
        this.historySize=100
        if(!gridCacheOfx.tiles) {
            this.addRandomTile()
            this.addRandomTile()
        }
        this.won=false
        this.lost=false
    }
    activeTiles() {
        return [].concat(...this.tiles).filter(tile => tile!==null)
    }
    addRandomTile() {
        let emptyCells=[]
        for(let r=0;r<this.rowCount;++r) {
            for(let c=0;c<this.colCount;++c) {
                if(!this.tiles[r][c]) {
                    emptyCells.push({r: r,c: c})
                }
            }
        }
        let index=~~(Math.random()*emptyCells.length)
        let cell=emptyCells[index]
        let newValue=Math.floor(Math.random()*2)+1

        let tileToAdd=new Tile(cell.c,cell.r,newValue,this.boxSize)
        this.tiles[cell.r][cell.c]=tileToAdd

    }
    cacheThis() {
        let serialized={
            tiles: this.tiles,
            history: this.history,
            score: this.score,
            highscore: this.highscore
        }
        localStorage.setItem(this.rowCount+'x'+this.colCount+'-grid',JSON.stringify(serialized))
    }
    createEmptyMatrix(rowCount,colCount) {
        let result=[]
        for(let r=0;r<rowCount;r++) {
            let row=result[r]=[];
            for(let c=0;c<colCount;c++) {
                row.push(null)
            }
        }
        return result
    }
    getTilesFromCache(cache) {
        let result=[]
        for(let r=0;r<cache.length;r++) {
            result[r]=[]
            for(let c=0;c<cache[0].length;c++) {
                let cachedCell=cache[r][c]
                result[r][c]=cachedCell? new Tile(cachedCell.col,cachedCell.row,cachedCell.value,this.boxSize):null
            }
        }
        return result
    }

    slide(row) {
        let rowLength=row.length
        let arr=row.filter(val => val)
        let zeros=Array(rowLength-arr.length).fill(null)
        arr=zeros.concat(arr)
        return arr
    }
    merge(row) {
        let rowLength=row.length
        for(let i=rowLength;i>=1;i--) {
            let a=row[i]
            let b=row[i-1]
            if(a&&b) {
                if(a.value===b.value) {
                    a.value++
                    this.updateScore(a.value)
                    a.mergedInto=b
                    if(a.value===11) this.won=true
                    row[i]=a
                    row[i-1]=null
                }
            }
        }
        return row
    }
    move(direction) {
        // 0 -> right, 1 -> down, 2 -> left, 3 -> up

        //add the current state of the matrix to the history
        if(!this.hasLost()) {
            this.addToHistory()

            //clone the initial Matrix of tiles
            let initialTiles=this.tiles.slice(0)

            //rotate the matrix according to the movement direction
            for(let i=0;i<direction;++i) this.tiles=this.rotateLeft(this.tiles)
        
            //move tiles to the right
            this.tiles=this.moveRight(this.tiles)

            //reposion matrix to the initial rotation
            for(let i=direction;i<4;++i)  this.tiles=this.rotateLeft(this.tiles)

            this.setPositions()

            if(this.isChanged(initialTiles)) {
                this.addRandomTile()
            }
        }
        else
            this.lost=true
        
        return this
    }
    moveRight(matrix) {
        for(let r=0;r<matrix.length;r++) {
            let row=matrix[r]
            row=this.slide(row)
            row=this.merge(row)
            row=this.slide(row)
            matrix[r]=row
        }
        return matrix
    }
    isChanged(initial) {
        for(let r=0;r<this.rowCount;++r) {
            for(let c=0;c<this.colCount;++c) {
                if(initial[r][c]!==this.tiles[r][c])
                    return true
            }
        }
        return false
    }
    rotateLeft(matrix) {
        let rows=matrix.length
        let columns=matrix[0].length
        let res=[]
        if(rows===columns) {
            for(let row=0;row<rows;++row) {
                res.push([]);
                for(let column=0;column<columns;++column) {
                    res[row][column]=matrix[column][columns-row-1]
                }
            }
        }
        else {
            for(let col=0;col<columns;++col) {
                res.push([])
                for(let row=0;row<rows;++row) {
                    res[col][row]=matrix[row][columns-col-1]
                }
            }
        }
        return res
    }
    setPositions() {
        this.tiles.forEach((row,rowIndex) => {
            row.forEach((tile,columnIndex) => {
                if(tile) {
                    tile.moveTo(rowIndex,columnIndex)
                }
            })
        })
    }
    setBoxSize(boxSize) {
        this.boxSize=boxSize
        this.tiles.map(row =>
            row.map(tile => {
                if(tile)
                    tile.boxSize=boxSize
            }
            )
        )
        return this
    }
    addToHistory() {
        if (this.history.length < this.historySize) {
            let newHistory = []
            for (let r = 0; r < this.rowCount; ++r) {
                newHistory[r] = []

                for (let c = 0; c < this.colCount; ++c) {
                    newHistory[r][c] = this.tiles[r][c] ? Object.assign(Object.create(this.tiles[r][c]), this.tiles[r][c]) : null
                }
            }
            this.history.push({
                tiles: newHistory,
                score: this.score,
                highscore: this.highscore
            })
        }
    }
    undo() {
        if(this.history.length>0) {
            this.lost=false
            let historyObj=this.history.pop()
            this.tiles=this.getTilesFromCache(historyObj.tiles)
            this.score=historyObj.score
            this.highscore=historyObj.highscore
            this.setPositions()
            return this
        }
        return null
    }
    updateScore(value) {
        this.score+=Math.pow(2,value)
        if(this.score>this.highscore)
            this.highscore=this.score
    }
    inlineStyle(boxMargin) {
        let width=Math.floor((this.colCount*this.boxSize)+(boxMargin*this.colCount)-boxMargin)
        let height=Math.floor((this.rowCount*this.boxSize)+(boxMargin*this.rowCount)-boxMargin)
        return {
            width: width,
            height: height,
            gridTemplateColumns: "repeat("+this.colCount+", [col-start] auto [col-end])",
            gridTemplateRows: "repeat("+this.rowCount+", [col-start] auto [col-end])",
            left: ((window.innerWidth-width-(boxMargin*2))/2)
        }
    }
    printMatrix() {
        this.tiles.map(row => {
            let s=''
            row.map(tile => {
                s+=tile? tile.row+','+tile.col+' ':'0 '
            })
            console.log(s)
        })
        console.log('')
    }
    hasWon() {
        return this.won
    }
    hasLost() {
        //check if all tiles are full
        if(this.activeTiles().length!==this.colCount*this.rowCount) {
            return false
        }

        //check if tiles can be merged horizontally
        for(let r=0;r<this.rowCount;r++) {
            let row=this.tiles[r]
            for(let c=0;c<row.length-1;c++) {
                if(row[c].value  ===row[c+1].value)
                    return false
            }
        }

            //check if tiles can be merged verticallly
        let rotatedTiles = this.rotateLeft(this.tiles)

        for(let r=0;r<this.colCount;r++) {
            let row=rotatedTiles[r]
            for(let c=0;c<row.length-1;c++) {
                if(row[c].value===row[c+1].value)
                    return false
            }
        }
       
        return true
    }
}
  
  export default Grid
import React, {useState, useEffect, forwardRef, useImperativeHandle} from 'react';
import {Swipeable} from 'react-swipeable'
import Swal from 'sweetalert2'
import './Board.scss';
import ActiveTiles from './ActiveTiles'
import Grid from './../classes/Grid'

const Board = forwardRef((params, ref) => {
    const {colCount, rowCount, boxSize, boxMargin} = params
    const [grid,setGrid]=useState(new Grid({colCount, rowCount, boxSize}))
    const [timerID, setTimerID] = useState(0)

    useEffect(() => { StartNewGame() }, [colCount, rowCount])
   
    useEffect(() => {
        setGrid((prev) => {
            let newGrid=Object.create(prev.setBoxSize(boxSize))
            newGrid.cacheThis()
            return newGrid;
        });
    },[boxSize])
   
    useEffect(() => { params.updateScores({score :grid.score, highscore:grid.highscore})},[grid.score,grid.highscore])
    
    useEffect(() => {
        if(grid.won) 
            Swal.fire({
                title: 'Congratulations !',
                text: 'You have reached the 2048! Do you want to continue',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Continue Playing',
                cancelButtonText: 'Start a New Game',
                reverseButtons: true
            }).then((result) => {
                if (result.dismiss===Swal.DismissReason.cancel) {
                    StartNewGame(true)                   
                }
            })
        clearInterval(timerID);
    },[grid.won])
    
    useEffect(() => {
        if(grid.lost) {
            Swal.fire({
                title: 'Lost!',
                text: 'Sorry, You have lost the game',
                imageUrl: './images/sad.svg',
                imageHeight: 88,
                imageWidth:88,
                showCancelButton: true,
                confirmButtonText: 'Start a new Game !',
                cancelButtonText: 'Undo the last move',
                reverseButtons: true
              }).then((result) => {
                if (result.value) StartNewGame(true)
                else if(result.dismiss===Swal.DismissReason.cancel) UndoMove()                   
              })
        }
        clearInterval(timerID);
    },[grid.lost])
  
    useEffect(() => {
        document.addEventListener('keydown', keyPressHandler);
        return () =>  document.removeEventListener('keydown', keyPressHandler);
    },[grid])


    
    const keyPressHandler=(e) => {
        if(e.keyCode>=37&&e.keyCode<=40) {
            e.preventDefault();
            let direction=-1
            // 0 -> right, 1 -> down, 2 -> left, 3 -> up
            if(e.key==='ArrowRight') direction=0
            else if(e.key==='ArrowDown') direction=1
            else if(e.key==='ArrowLeft') direction = 2
            else if(e.key==='ArrowUp') direction = 3
            move(direction)
        }
    }
  
    const StartNewGame=(clearCacheBefore) => {
        if(clearCacheBefore) clearCacheForNewGame();
            
        setGrid(prev => {
            let newGrid=new Grid({colCount,rowCount,boxSize})
            newGrid.cacheThis()
            return newGrid;
        })
    }
    const UndoMove=() => {
        if(grid.activeTiles().length>2)
            setGrid((prev) => {
                let newGrid=Object.create(prev.undo())
                    newGrid.cacheThis()
                    return newGrid;
            });
    }
    const move=(direction) => {

        setGrid((prev) => {
            let newGrid=Object.create(prev.move(direction))
            newGrid.cacheThis()
            return newGrid;
        });
    }
    

    useImperativeHandle(ref, () => ({
        undo() {
            UndoMove();
        },
        newGame() {
            StartNewGame(true)
        },
        random() {
            if(timerID){
                clearInterval(timerID)
                setTimerID(0)
            }
            else{
                setTimerID( setInterval(() => {
                    if(!grid.lost||!grid.won) {  
                        move(Math.floor(Math.random()*4)+1) 
                    }
                },50))
            }
        }
        
    }));
    
    const clearCacheForNewGame = ()=>{
        let cache = JSON.parse(localStorage.getItem(rowCount + 'x' + colCount + '-grid'))
        localStorage.setItem(rowCount + 'x' + colCount + '-grid', JSON.stringify({highscore : cache.highscore}))
    }
      return (
          <Swipeable
              onSwipedRight={() => move(0)}
              onSwipedDown={()=> move(1) }     
              onSwipedLeft={() => move(2)}
              onSwipedUp={() => move(3)}>
              
            <div className='grid' style={ grid ? {...grid.inlineStyle(boxMargin)} : null} >
                { Array(colCount * rowCount).fill(0).map((box,i) => <div key={i} className='box'></div>)}
                <ActiveTiles grid={grid} boxMargin={boxMargin}/>
            </div>
        </Swipeable>
        );
  });
export default Board;

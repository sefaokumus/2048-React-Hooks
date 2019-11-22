import React,{useState,useEffect, useRef} from 'react';
import useWindowSize from './classes/hooks/useWindowSize'
import './App.scss';
import Board from './components/Board'

const getGridCache=() => {
  return JSON.parse(localStorage.getItem('grid'))
}

function App() {
  const gridCache=getGridCache();

  const [colCount,setColCount]=useState(gridCache ? gridCache.colCount:4)
  const [rowCount, setRowCount] = useState(gridCache? gridCache.rowCount:4)
  const [boxSize,setBoxSize]=useState(gridCache ? gridCache.boxSize:100)
  const [boxMargin]=useState(10)
  const [windowWidth, windowHeight] = useWindowSize();
  const [isRandomFilling, setIsRandomFilling] = useState(false)

  const [score,setScore]=useState(0)
  const [highscore,setHighscore] = useState(0)
  const boardRef=useRef();
  
  
  const headerHeight = 240

  //update the boxSize according to the window size
  useEffect(() => { 
    let containerWidth = windowWidth - (windowWidth*0.2);
    let containerHeight = windowHeight  -(headerHeight + 50); //header height + 30px margin from bottom
    let boxSizeForWidth = (containerWidth / colCount) - (boxMargin )
    let boxSizeForHeight = (containerHeight / rowCount) - (boxMargin )
    let boxSizeToBe = Math.floor(Math.min(boxSizeForWidth,boxSizeForHeight))

    if(boxSizeToBe > 0)
      setBoxSize(100 > boxSizeToBe ? boxSizeToBe : 100)
  },[windowWidth,windowHeight,colCount,rowCount,boxMargin])

  useEffect(() => {
    localStorage.setItem('grid', JSON.stringify({
      colCount: colCount,
      rowCount: rowCount,
      boxSize : boxSize,
  }))
  },[colCount,rowCount,boxSize])


  const updateScores=({score, highscore}) => {
    setScore(score)
    setHighscore(highscore)
  }

  const handleNewGame=() => {
    boardRef.current.newGame()
    setIsRandomFilling(false)
  }
  const handleRandomFill=() => {
    boardRef.current.random()
    setIsRandomFilling(prev => !prev)
  }


 
  return (
    <div className='container' style={{
      width: Math.floor((colCount*boxSize)+(boxMargin*colCount)+boxMargin)
    }}>

      <div className="header" style={{height:headerHeight}} >
        <div className="title"><img alt='logo' src='./images/logo.svg' /></div>
        <div className="score score-panel"> <h4>Score</h4>{score}</div>
        <div className="highscore score-panel"> <h4>Highcore</h4>{highscore}</div>
        <div className="buttons">
          <div className="new-game">
            <button className='button' onClick={handleNewGame}>New Game</button>
          </div>
          <div className="random">
            <button className='button' onClick={handleRandomFill}>{ isRandomFilling ? 'Stop Filling...' : 'Random Fill'}</button>
          </div>
          <div className="undo">
            <button className='button' onClick={() => boardRef.current.undo()}>Undo</button>
        </div>

        </div>
    

        <div className="column-select"> 
          <SelectBox
            value={colCount}
            maxValue='15'
            label='Column Count'
            onChange={(event) => {
              setColCount(event.target.value)
              localStorage.setItem('colCount', colCount)
            }} />
        </div>

        <div className="row-select"> 
          <SelectBox
            value={rowCount}
            maxValue='15'
            label='Row Count'
            onChange={(event) =>  {
              setRowCount(event.target.value)
              localStorage.setItem('rowCount', rowCount)
            }}/>
        </div>
      </div>
      
      <Board
        colCount={colCount}
        rowCount={rowCount}
        boxSize={boxSize}
        boxMargin={boxMargin}
        ref={boardRef}
        updateScores={updateScores}
      />

  </div>
            
  );
}

function SelectBox(params) {
  return <label className="dropdown">
          <label className="label">{params.label}</label>

          <span className="dropdown_caret"></span>

          <select className="dropdown_select" value={params.value} onChange={params.onChange}>
          {
              [...Array(parseInt(params.maxValue)).keys()].map((option,i ) => {
                if(option>2)
                  return <option key={i} value={option}>{option}</option>
              })
            }
          </select>
        </label>
}
export default App;

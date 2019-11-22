import React from 'react'

const ActiveTiles = (params) => {
    if(params.grid) {
        return <div className='tiles' >{
            params.grid.activeTiles().map((tile,i) => {
                        return <div key={tile.id} id={tile.id} className={tile.cssClasses()} style={tile.inlineStyle(params.boxMargin)}>
                            <span style={{...tile.tileInnerStyle()}}>{  Math.pow(2,tile.value) }</span>
                        </div>
                })
            }
         
        </div>
    }
    else
        return ''
}

export default ActiveTiles
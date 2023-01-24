import React from 'react';
import map from './MapFormat';
import './Map.css'

interface MapProps {
    playerPos: [number, number],
    enemiesPos: [number, number][],
    addEnemies: (x: number, y: number) => void
}

const Map: React.FC<MapProps> = ({playerPos, enemiesPos, addEnemies}) => {
    const mapFilled = map.map((row, rowIndex) => {
        return row.map((cell, cellIndex) => {
            if(playerPos[0] === rowIndex && playerPos[1] === cellIndex){
                return 'player'
            }
            else if(map[rowIndex][cellIndex] === 0){
                return 'wall'
            }
            else if(enemiesPos.some(([x, y]) => x === rowIndex && y === cellIndex)){
                return 'enemy'
            }
            else{
                return 'empty'
            }
        })
    })

    return (
        <table className='map'>
            <tbody>
                {mapFilled.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className={cell} onClick={() => addEnemies(rowIndex, cellIndex)}/>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Map;

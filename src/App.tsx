import React, { useState } from "react";
import Map from "./Map";
import { depthFirstSearch } from "./AI";
import State from "./State"


function App() {
  const [state, setState] = useState<State>(new State(
    50,
    [15, 15],
    [[20, 10], [6, 18], [8, 21]],
    10,
    0
  ));

  const [step, setStep] = useState<number>(0);

  const [path, setPath] = useState<State[]>([]);

  const handleRunAI = () => {
    let computedPath = depthFirstSearch(state, 100000)
    console.log(computedPath)
    if(computedPath != null)
      setPath(computedPath)
      setStep(0)
  };

  const previous = () => {
    if(step <= 0) return

    console.log(path[step-1])
    setState(path[step-1]);
    setStep(step-1);
  }

  const play = () => {

  }

  const next = () => {
    if(step >= path.length-1) return

    console.log(path[step+1])
    setState(path[step+1])
    setStep(step+1)
  }

  const reset = () => {
    setState(new State(
      50,
      [15, 15],
      [],
      10,
      0
    ))
    setPath([])
    setStep(0)
  }

  const addEnemy = (x: number, y: number): void => {
    let enemyPos = state.enemiesPos.slice()
    let index = enemyPos.findIndex(([ex, ey]) => ex === x && ey === y)
    if(index !== -1){
      enemyPos.splice(index, 1)
    }
    else{
      if(state.playerPos[0] === x && state.playerPos[1] === y) return
      enemyPos.push([x, y])
    }
    console.log(`Enemy added at ${x};${y}`)
    setState(new State(
      state.playerHp,
      state.playerPos,
      enemyPos,
      state.pa,
      state.move2Counter,
      state.action
    ))
    setPath([])
    setStep(0)
  }


  return (
    <div>
      <Map playerPos={state.playerPos} enemiesPos={state.enemiesPos} addEnemies={addEnemy}/>
      <div>
        <p>HP:{state.playerHp}</p>
        <p>PA:{state.pa}</p>
        <p>Action:{state.action}</p>
      </div>
      <button onClick={handleRunAI}>Run AI</button>
      <button onClick={previous}>Previous Step</button>
      <button onClick={play}>Play</button>
      <button onClick={next}>Next Step</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default App;

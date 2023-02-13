import State from "./State";
import Map from "./MapFormat";

function computePlayerMovement(state: State, [x, y]: [number, number], move2 = false): State | null{
    const newPos: [number, number] = [state.playerPos[0] + x, state.playerPos[1] + y];
    const [xp, yp] = newPos;
    if(!Map[xp] || Map[xp][yp] !== 1) return null
    
    let newEnemiesPos = pushEnemies(newPos, state.enemiesPos)

    newEnemiesPos = computeEnemiesMovement(newPos, newEnemiesPos)
    if(newEnemiesPos.some(([x, y]) => x === newPos[0] && y === newPos[1])){
        return new State(0, newPos, newEnemiesPos, 0, 0)
    }
    else{
        return new State(
            move2 ? state.playerHp - 2 : state.playerHp - 1, 
            newPos, 
            newEnemiesPos, 
            move2 ? state.pa - 2 : state.pa - 1, 
            move2 ? state.move2Counter + 1 : 
            state.move2Counter,
            "move_" + (move2 ? "2" : "1")
        );
    }
}

function generateNewStates(state: State): State[] {
    let newStates: State[] = [];

    // Move 1 tile in each direction
    if (state.pa >= 1) {
        let moves: [number, number][] = [[1, 0], [0, 1], [-1, 0], [0, -1]]
        for(let move of moves){
            let newState = computePlayerMovement(state, move)
            if(newState) newStates.push(newState)
        }
    }

    // Move 2 tiles in each direction
    if (state.pa >= 2 && state.move2Counter < 2) {
        let moves: [number, number][] = [[2, 0], [0, 2], [-2, 0], [0, -2]]
        for(let move of moves){
            let newState = computePlayerMovement(state, move, true)
            if(newState) newStates.push(newState)
        }
    }

    // use spell 
    if (state.pa >= 5) {
        let pos: [number, number][] = [[1, 1], [-1, 1], [-1, -1], [1, -1]]
        for(let [x, y] of pos){
            let newEnemiesPos = computeEnemiesMovement([state.playerPos[0] + x, state.playerPos[1] + y], state.enemiesPos)
            if(newEnemiesPos.some(([x, y]) => x == state.playerPos[0] && y == state.playerPos[1])){
                newStates.push(new State(0, state.playerPos, newEnemiesPos, 0, 0, "attract"))
            }
            else{
                newStates.push(new State(state.playerHp - 5, state.playerPos, newEnemiesPos, state.pa - 5, state.move2Counter, "attract"));
            }
        }
    }

    // End turn
    let newEnemiesPos = computeEnemiesMovement(state.playerPos, state.enemiesPos)
    if(newEnemiesPos.some(([x, y]) => x == state.playerPos[0] && y == state.playerPos[1])){
        newStates.push(new State(0, state.playerPos, newEnemiesPos, 0, 0))
    }
    else{
        newStates.push(new State(state.playerHp - 1, state.playerPos, newEnemiesPos, 9, 0, "end turn"));
    }
    
    return newStates.sort((a, b) => {
        if(a.playerHp === 0){
            if(b.playerHp === 0) return 0
            else return -1
        }
        if(b.playerHp === 0) return 1

        if(a.enemiesPos.length > b.enemiesPos.length) return 1
        else if (b.enemiesPos.length > a.enemiesPos.length) return -1
        else if(a.action === "end turn"){
            return -1
        }
        else if(b.action === "end turn"){
            return 1
        }
        else return a.playerHp - b.playerHp
    }).reverse();
}

// Adapted from https://bolgrot.thedrin.fr/game.html
function computeDiag(enemyPos: [number, number], playerPos: [number, number]): [number, number] | null{
    if(enemyPos[0] - enemyPos[1] === playerPos[0] - playerPos[1]){
        if(enemyPos[0] <= playerPos[0] - 1){
            return [enemyPos[0] + 1, enemyPos[1] + 1];
        }
        else if(enemyPos[0] >= playerPos[0] + 1)
        {
            return [enemyPos[0] - 1, enemyPos[1] - 1];
        }
    }
    else if(enemyPos[0] + enemyPos[1] === playerPos[0] + playerPos[1])
    {
        if(enemyPos[0] <= playerPos[0] - 1)
        {
            return [enemyPos[0] + 1, enemyPos[1] - 1];
        }
        else if(enemyPos[0] >= playerPos[0] + 1)
        {
            return [enemyPos[0] - 1, enemyPos[1] + 1];
        }
    }
    return null
}

function computeSameRowLine(enemyPos: [number, number], playerPos: [number, number]): [number, number] | null {
    if (enemyPos[1] === playerPos[1]) {
        if (enemyPos[0] < playerPos[0]) {
            return [enemyPos[0] + 1, enemyPos[1]];
        } else if (enemyPos[0] > playerPos[0]) {
            return [enemyPos[0] - 1, enemyPos[1]];
        }
    }
    else if (enemyPos[0] === playerPos[0]) {
        if (enemyPos[1] < playerPos[1]) {
            return [enemyPos[0], enemyPos[1] + 1];
        } else if (enemyPos[1] > playerPos[1]) {
            return [enemyPos[0], enemyPos[1] - 1];
        }
    } 
    return null;
}

function computeDifferentPos(enemyPos: [number, number], playerPos: [number, number]): [number, number] | null {
    if (enemyPos[0] < playerPos[0]) {
        return [enemyPos[0] + 1, enemyPos[1]];
    } else if (enemyPos[0] > playerPos[0]) {
        return [enemyPos[0] - 1, enemyPos[1]];
    }
    else if (enemyPos[1] < playerPos[1]) {
        return [enemyPos[0], enemyPos[1] + 1];
    } else if (enemyPos[1] > playerPos[1]) {
        return [enemyPos[0], enemyPos[1] - 1];
    }
    return null;
}

function computeEnemiesMovement(playerPos: [number, number], enemiesPos: Array<[number, number]>): Array<[number, number]> {
    let newEnemiesPos: Array<[number, number]> = enemiesPos.slice();
    for (let i = 0; i < enemiesPos.length; i++) {
        let enemyPos = enemiesPos[i];
        let newEnemyPos: [number, number] = [enemyPos[0], enemyPos[1]];
        
        let val = computeDiag(newEnemyPos, playerPos);
        if(!val) val = computeSameRowLine(newEnemyPos, playerPos);
        if(!val) val = computeDifferentPos(newEnemyPos, playerPos);
        if(!val) val = [0, 0]

        if(!newEnemiesPos.some(([x, y]) => val && val[0] === x && val[1] === y) && Map[val[0]] && Map[val[0]][val[1]] === 1){
            newEnemiesPos[i] = val;
        }
    }
    return newEnemiesPos;
}

// MMMMh
function pushEnemies(playerPos: [number, number], enemiesPos: Array<[number, number]>): Array<[number, number]> {
    let newEnemiesPos = enemiesPos.slice();
    for (let i = 0; i < enemiesPos.length; i++) {
        if (enemiesPos[i][0] === playerPos[0] && enemiesPos[i][1] === playerPos[1]) {
            // remove the enemy that the player stepped on
            newEnemiesPos.splice(i, 1);
            // push all enemies around the killed enemy
            let pushPos: Array<[number, number]> = [[enemiesPos[i][0] - 1, enemiesPos[i][1]], [enemiesPos[i][0] + 1, enemiesPos[i][1]], [enemiesPos[i][0], enemiesPos[i][1] - 1], [enemiesPos[i][0], enemiesPos[i][1] + 1]];
            for (let j = 0; j < pushPos.length; j++) {
                let toPush = newEnemiesPos.find((val) => val[0] === pushPos[j][0] && val[1] === pushPos[j][1]);
                if (toPush) {
                    let f = toPush
                    newEnemiesPos.filter(([x, y]) => x != f[0] || y != f[1])
                    newEnemiesPos.push(pushPos[j]);
                }
            }
            break;
        }
    }
    return newEnemiesPos;
}

export function depthFirstSearch(initialState: State, maxIter: number = -1): State[] | null {
    let stack: State[] = []
    let visited: any = {}
    let steps = 0;
    let min = Infinity;
    let parent: any = {};
    parent[initialState.hashCode()] = null;
    stack.push(initialState);
    while (stack.length > 0) {
        let currentState = stack.pop();
        if(currentState === undefined) continue;
        if(steps % 1000 === 0) console.log(steps, stack.length, min)
        if(steps > maxIter) {
            let path = [currentState];
            let current: State = currentState;
            while (current !== null) {
                current = parent[current.hashCode()];
                if (current !== null) {
                    path.unshift(current);
                }
            }
            return path;
        }

        visited[currentState.hashCode()] = true;
        let nextStates = generateNewStates(currentState);
        for (let i = 0; i < nextStates.length; i++) {
            let nextState = nextStates[i];
            if(!visited[nextState.hashCode()] && nextState.playerHp > 0){
                parent[nextState.hashCode()] = currentState;
                if (nextState.enemiesPos.length === 0) {
                    let path = [nextState];
                    let current: State | null = nextState;
                    while (current !== null) {
                        current = parent[current.hashCode()];
                        if (current !== null) {
                            path.unshift(current);
                        }
                    }
                    return path;
                }
                if(nextState.enemiesPos.length < min) min = nextState.enemiesPos.length;
                stack.push(nextState);
            }
        }
        steps++;
    }
    return null;
}



let enemies: [number, number][] = []
for(let i = 0; i < 15; i++){
    let nok = true;
    while(nok){
        let enemy: [number, number] = [Math.round(Math.random()*30), Math.round(Math.random()*30)]

        if(enemy[0] == 15 && enemy[1] == 15) continue;
        if(Map[enemy[0]] && Map[enemy[0]][enemy[1]] === 0) continue; 

        if(!enemies.find(([x, y]) => x == enemy[0] && y == enemy[1])){
            nok = false;
            enemies.push(enemy)
        }
    }
}

console.log(enemies)

/*const enemies: [number, number][] = [
    [ 4, 17 ],  [ 13, 26 ],
    [ 29, 29 ], [ 12, 6 ],
    [ 20, 9 ],  [ 25, 0 ],
    [ 10, 10 ], [ 27, 14 ],
    [ 14, 2 ],  [ 14, 13 ],
    [ 15, 19 ], [ 9, 22 ],
    [ 20, 27 ], [ 18, 9 ],
    [ 28, 3 ]
  ]*/
  

let state = new State(40, [15, 15], enemies, 10, 0)
let goalFound = depthFirstSearch(state);
console.log(goalFound);
for(let state of goalFound ?? []){
    console.log(state.toString())
}

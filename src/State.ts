import Map from "./MapFormat";

export default class State {
    playerHp: number;
    playerPos: [number, number];
    enemiesPos: Array<[number, number]>;
    pa: number;
    move2Counter: number;
    action: string;

    constructor(playerHp: number, playerPos: [number, number], enemiesPos: Array<[number, number]>, pa: number, move2Counter: number, action: string = "") {
        this.playerHp = playerHp;
        this.playerPos = playerPos;
        this.enemiesPos = enemiesPos;
        this.pa = pa;
        this.move2Counter = move2Counter;
        this.action = action;
    }

    areStatesEqual(state: State): boolean {
        if (this.playerHp !== state.playerHp || this.playerPos[0] !== state.playerPos[0] || this.playerPos[1] !== state.playerPos[1] || this.pa !== state.pa || this.move2Counter !== state.move2Counter || this.enemiesPos.length !== state.enemiesPos.length) {
            return false;
        }
        let pos1: Array<[number, number]> = this.enemiesPos.slice().sort();
        let pos2: Array<[number, number]> = state.enemiesPos.slice().sort();
        for (let i = 0; i < pos1.length; i++) {
            if (pos1[i][0] !== pos2[i][0] || pos1[i][1] !== pos2[i][1]) {
                return false;
            }
        }
        return true;
    }

    toString(): string{
        let ret = ""
        for(let i = 0; i < 30; i++){
            for(let j = 0; j < 30; j++){
                if(this.playerPos[0] === i && this.playerPos[1] === j){
                    ret += "P"
                }
                else if(this.enemiesPos.some(([x, y]) => x === i && y === j)){
                    ret += "E"
                }
                else if(Map[i][j] === 1){
                    ret += "#"
                }
                else{
                    ret += " "
                }
            }
            ret += '\n'
        }
        return ret
    }

    hashCode(): number {
        let code = 17;
        code = 31 * code + this.playerHp;
        code = 31 * code + this.playerPos[0];
        code = 31 * code + this.playerPos[1];
        code = 31 * code + this.pa;
        code = 31 * code + this.move2Counter;
        // sorting the position of enemies
        this.enemiesPos.sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));
        for (let i = 0; i < this.enemiesPos.length; i++) {
            code = 31 * code + this.enemiesPos[i][0];
            code = 31 * code + this.enemiesPos[i][1];
        }
        return code;
    }
}

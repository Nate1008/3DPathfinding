
import * as THREE from 'three';

const fourdir = [[0, 1], [1, 0], [-1, 0], [0, -1]];
const eightdir = [[0, 1], [-1, 1], [1, 0], [1, -1], [-1, 0], [-1, 1], [0, -1], [1, -1]];


const dfs = (board, boardCoor, startCoor, targetCoor, diagonal) => {
    let stack = [];
    stack.push(startCoor);
    while(stack !== []) {
        console.log(stack);
        let node = stack.pop();
        console.log(node);
        if (boardCoor[node[0]][node[1]] === 0) {
            console.log('VISITED -> x = ' + node[1] + ' y = ' + node[0]);
            boardCoor[node[0]][node[1]] = 2;
            let dirs = [];
            if (diagonal) {
              dirs = eightdir;
            } else {
              dirs = fourdir;
            }
            for(let dir in dirs) {
                let neighbor;
                try {
                    neighbor = boardCoor[node[0] + dir[0]][node[1] + dir[1]];
                } catch (err) {
                  continue;
                }
                board[node[0] + dir[0]][node[1] + dir[1]].material.color = THREE.Color(0x003994);
                if (neighbor === 0) {
                  stack.push([ (node[0] + dir[0]), (node[1] + dir[1]) ]);
                }
            }
        }
    }
}





export { dfs };

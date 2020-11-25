
import * as THREE from 'three';

const fourdir = [[0, 1], [1, 0], [-1, 0], [0, -1]];
const eightdir = [[0, 1], [-1, 1], [1, 0], [1, -1], [-1, 0], [-1, 1], [0, -1], [1, -1]];


const dfs = (board, boardCoor, startCoor, targetCoor, diagonal, rows) => {
    let stack = [];
    stack.push(startCoor);
    while(stack.length) {
        console.log(stack);
        console.log(boardCoor);
        let node = stack.pop();
        if (node[0] == targetCoor[0] && node[1] == targetCoor[1]) {
          console.log('TARGET WAS FOUND');
          return;
        }

        if (boardCoor[node[0]][node[1]] === 0) {
            boardCoor[node[0]][node[1]] = 2;
            let dirs = [];
            if (diagonal) {
              dirs = eightdir;
            } else {
              dirs = fourdir;
            }
            for(let dir of dirs) {
                let neighbor;
                try {
                    neighbor = boardCoor[node[0] + dir[0]][node[1] + dir[1]];
                } catch (err) {
                  continue;
                }
                // board[(node[0] + dir[0] * rows * 2) + (node[1] + dir[1])].material = THREE.MeshBasicMaterial({ color: 0x00b8d2 });
                if (neighbor === 0) {
                  stack.push([ (node[0] + dir[0]), (node[1] + dir[1]) ]);
                }
            }
        }
    }
    console.log('TARGET WAS NOT FOUND');
    return;
}

const bfs = (board, boardCoor, startCoor, targetCoor, diagonal, rows) => {
    let path = [];
    boardCoor[startCoor[0]][startCoor[1]] = 2;
    let queue = [];
    queue.unshift(startCoor);
    while (queue.length) {
        let node = queue.pop();
        if (node[0] == targetCoor[0] && node[1] == targetCoor[1]) {
          console.log('TARGET WAS FOUND');
          return;
        }
        if(boardCoor[node[0]][node[1]] === 0) {
            console.log('VISITED')
            console.log(node);
            let dirs = [];
            if (diagonal) {
              dirs = eightdir;
            } else {
              dirs = fourdir;
            }
            for(let dir of dirs) {
                let neighbor;
                try {
                    neighbor = boardCoor[node[0] + dir[0]][node[1] + dir[1]];
                } catch (err) {
                  continue;
                }
                // board[(node[0] + dir[0] * rows * 2) + (node[1] + dir[1])].material = THREE.MeshBasicMaterial({ color: 0x00b8d2 })
                if (neighbor === 0) {
                  boardCoor[node[0]][node[1]] = 2;
                  queue.unshift([ (node[0] + dir[0]), (node[1] + dir[1]) ]);
                }
            }
        }
    }
    console.log('TARGET WAS NOT FOUND');
    return
}





export { dfs, bfs };

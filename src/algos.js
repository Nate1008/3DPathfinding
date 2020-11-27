
import * as THREE from 'three';

const fourdir = [[0, 1], [1, 0], [-1, 0], [0, -1]];
const eightdir = [[0, 1], [-1, 1], [1, 0], [1, -1], [-1, 0], [-1, 1], [0, -1], [1, -1]];


const dfs = (board, boardCoor, boardPath, startCoor, targetCoor, diagonal, rows) => {
    let stack = [];
    stack.push(startCoor);
    boardPath[startCoor[0]][startCoor[1]].push(startCoor);
    while(stack.length) {
        let node = stack.pop();
        if (node[0] == targetCoor[0] && node[1] == targetCoor[1]) {
          console.log('TARGET WAS FOUND');
          console.log(boardPath[node[0]][node[1]]);
          return boardPath[node[0]][node[1]];
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
                // board[(node[0] + dir[0] * rows * 2) + (node[1] + dir[1])].material = new THREE.MeshBasicMaterial({ color: 0x00b8d2 });
                if (neighbor === 0) {
                  let nextCoor = [ (node[0] + dir[0]), (node[1] + dir[1]) ]
                  stack.push(nextCoor);
                  boardPath[nextCoor[0]][nextCoor[1]] = boardPath[node[0]][node[1]].concat([nextCoor]);
                }
            }
        }
    }
    console.log('TARGET WAS NOT FOUND');
    return;
}

const bfs = (board, boardCoor, boardPath, startCoor, targetCoor, diagonal, rows) => {
    let queue = [];
    queue.unshift(startCoor);
    boardPath[startCoor[0]][startCoor[1]].push(startCoor);
    boardCoor[startCoor[0]][startCoor[1]] = 2;
    while (queue.length) {
        let node = queue.pop()
        console.log(node);
        if (node[0] == targetCoor[0] && node[1] == targetCoor[1]) {
          console.log('TARGET WAS FOUND');
          console.log(boardPath[node[0]][node[1]]);
          return boardPath[node[0]][node[1]];
        }

        if (!(node[0] === startCoor[0] && node[1] == startCoor[1])) {
            board[(rows * node[1]) + node[0]].material = new THREE.MeshBasicMaterial({ color: 0x00b8d2 });
        }
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
            if (neighbor === 0) {
              neighbor = 2;
              let nextCoor = [ (node[0] + dir[0]), (node[1] + dir[1]) ]
              boardPath[nextCoor[0]][nextCoor[1]] = boardPath[node[0]][node[1]].concat([nextCoor]);
              queue.unshift(nextCoor);
            }
        }
    }
    console.log('TARGET WAS NOT FOUND');
    return;
}





export { dfs, bfs };

import * as THREE from 'three';

const dirs = [
    [0, 1],
    [1, 0],
    [-1, 0],
    [0, -1]
];
let queue = [];

const reset = (boardPath, startCoor) => {
	queue = [startCoor];
	boardPath[startCoor[0]][startCoor[1]].push(startCoor);
}

const dfs = (board, boardCoor, boardPath, node, startCoor, targetCoor, rows, delay) => {
	if (node[0] == targetCoor[0] && node[1] == targetCoor[1]) {
		console.log('TARGET WAS FOUND');
		console.log(boardPath[node[0]][node[1]]);
		return boardPath[node[0]][node[1]];
	}

	if (!(node[0] === startCoor[0] && node[1] == startCoor[1])) {
		board[(rows * node[1]) + node[0]].material = new THREE.MeshBasicMaterial({
			color: 0x002667
		});
	}

	if (boardCoor[node[0]][node[1]] === 0) {
		boardCoor[node[0]][node[1]] = 2;
		let ret;
		for (let dir of dirs) {
			let neighbor;
			try {
				neighbor = boardCoor[node[0] + dir[0]][node[1] + dir[1]];
			} catch (err) {
				continue;
			}
			if (neighbor === 0) {
				let nextCoor = [(node[0] + dir[0]), (node[1] + dir[1])];
				boardPath[nextCoor[0]][nextCoor[1]] = boardPath[node[0]][node[1]].concat([nextCoor]);
				ret = setTimeout(() => {
					let _ret = dfs(board, boardCoor, boardPath, nextCoor, startCoor, targetCoor, rows, delay);
					console.log(_ret)
					if (_ret) {
						return _ret;
					}
				}, delay);
				return ret;


			}
		}
	}
	console.log('TARGET WAS NOT FOUND');
	return;
}


const bfs = (board, boardCoor, boardPath, startCoor, targetCoor, rows, delay) => {
	console.log(delay);
	if (!queue.length) {
		console.log('TARGET WAS NOT FOUND');
		return;
	}
	let node = queue.pop();

	if (boardCoor[node[0]][node[1]] === 0) {
		boardCoor[node[0]][node[1]] = 2;
		if (node[0] == targetCoor[0] && node[1] == targetCoor[1]) {
			console.log('TARGET WAS FOUND');
			console.log(boardPath[node[0]][node[1]]);
			return boardPath[node[0]][node[1]];
		}

		if (!(node[0] === startCoor[0] && node[1] == startCoor[1])) {
			board[(rows * node[1]) + node[0]].material = new THREE.MeshBasicMaterial({
				color: 0x002667
			});
		}
		for (let dir of dirs) {
			let neighbor;
			try {
				neighbor = boardCoor[node[0] + dir[0]][node[1] + dir[1]];
			} catch (err) {
				continue;
			}
			if (neighbor === 0) {
				let nextCoor = [(node[0] + dir[0]), (node[1] + dir[1])]
				boardPath[nextCoor[0]][nextCoor[1]] = boardPath[node[0]][node[1]].concat([nextCoor]);
				queue.unshift(nextCoor);
			}
		}
	}

	let ret = setTimeout(() => {
		let _ret = bfs(board, boardCoor, boardPath, startCoor, targetCoor, rows, delay);

		if (_ret) {
			return _ret;
		}
	}, delay - 100);
	return ret;
}





export {
	reset,
	dfs,
	bfs
};
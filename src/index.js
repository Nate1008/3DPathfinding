// ┏━━━┓┏━━━┓┏━━━┓┏━━━┓┏━━━━┓┏┓ ┏┓┏━━━┓┏━━┓┏━┓ ┏┓┏━━━┓┏━━┓┏━┓ ┏┓┏━━━┓
// ┃┏━┓┃┗┓┏┓┃┃┏━┓┃┃┏━┓┃┃┏┓┏┓┃┃┃ ┃┃┃┏━━┛┗┫┣┛┃┃┗┓┃┃┗┓┏┓┃┗┫┣┛┃┃┗┓┃┃┃┏━┓┃
// ┗┛┏┛┃ ┃┃┃┃┃┗━┛┃┃┃ ┃┃┗┛┃┃┗┛┃┗━┛┃┃┗━━┓ ┃┃ ┃┏┓┗┛┃ ┃┃┃┃ ┃┃ ┃┏┓┗┛┃┃┃ ┗┛
// ┏┓┗┓┃ ┃┃┃┃┃┏━━┛┃┗━┛┃  ┃┃  ┃┏━┓┃┃┏━━┛ ┃┃ ┃┃┗┓┃┃ ┃┃┃┃ ┃┃ ┃┃┗┓┃┃┃┃┏━┓
// ┃┗━┛┃┏┛┗┛┃┃┃   ┃┏━┓┃  ┃┃  ┃┃ ┃┃┃┃   ┏┫┣┓┃┃ ┃┃┃┏┛┗┛┃┏┫┣┓┃┃ ┃┃┃┃┗┻━┃
// ┗━━━┛┗━━━┛┗┛   ┗┛ ┗┛  ┗┛  ┗┛ ┗┛┗┛   ┗━━┛┗┛ ┗━┛┗━━━┛┗━━┛┗┛ ┗━┛┗━━━┛




import * as THREE from 'three';
import Stats from 'three/examples/jsm/utils/stats.module.d.js';
import {
	OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';



//LETS
let group = new THREE.Group();
let board = [];
let outlines = [];
let startCoor = [];
let targetCoor = [];
let boardCoor = [];
let boardPath = [];
let boardWeight = [];
let rows = 5;
let cols = rows;
let progress = false;
let path = [];

//CONSTS
const width = 1.5;
const height = width / 2;

//------------------------------------------------------------------------------------------------------------------------------------
//NODE TYPES
const ground = new THREE.Mesh(
	new THREE.BoxGeometry(width, height, width),
	new THREE.MeshBasicMaterial({
		color: 0xe1e1e1
	})
);

const build = new THREE.Mesh(
	new THREE.BoxGeometry(width, height + 1, width),
	new THREE.MeshBasicMaterial({
		color: 0x6f6c6c
	})
);

const start = new THREE.Mesh(
	new THREE.BoxGeometry(width, height, width),
	new THREE.MeshBasicMaterial({
		color: 0x4fc134
	})
);

const target = new THREE.Mesh(
	new THREE.BoxGeometry(width, height, width),
	new THREE.MeshBasicMaterial({
		color: 0xff2020
	})
);

let beaconstart = new THREE.Mesh(
	new THREE.BoxGeometry(width, height+5, width),
	new THREE.MeshBasicMaterial({
		color: 0x4fc134,
		opacity: 0.2,
		transparent: true,
		side: THREE.DoubleSide,
	})
);

let beacontarget = new THREE.Mesh(
	new THREE.BoxGeometry(width, height+5, width),
	new THREE.MeshBasicMaterial({
		color: 0xff2020,
		opacity: 0.2,
		transparent: true,
		side: THREE.DoubleSide,
	})
);

const visited = new THREE.Mesh(
	new THREE.BoxGeometry(width, height, width),
	new THREE.MeshBasicMaterial({
		color: 0x32c6db
	})
);

const _path = new THREE.Mesh(
	new THREE.BoxGeometry(width, height, width),
	new THREE.MeshBasicMaterial({
		color: 0xfdd14b
	})
);

//------------------------------------------------------------------------------------------------------------------------------------
//GET THE CURRENT BOARD INTO AN 2D ARRAY
const getBoard = () => {
	group.traverse((node) => {
		if (!(node instanceof THREE.Mesh)) {
			return;
		} else if (node.material.side === THREE.BackSide) {
			return;
		}
		let r = Math.round(rows + (node.position.x / (width + 0.05)));
		let c = Math.round(cols + (node.position.z / (width + 0.05)));
		boardPath[c][r] = [];
		switch (board[((2 * rows) * r) + c].material.color.getHex()) {
			case start.material.color.getHex():
				startCoor = [c, r];
				boardCoor[c][r] = 0;
				break;
			case target.material.color.getHex():
				targetCoor = [c, r];
				boardCoor[c][r] = 0;
				break;
			case build.material.color.getHex():
				boardCoor[c][r] = 1;
				break;
			default:
				boardCoor[c][r] = 0;
		}
	})
}

//------------------------------------------------------------------------------------------------------------------------------------
//SETING UP THE SCENE - BOILERPLATE

const renderer = new THREE.WebGLRenderer({
	antialias: true,
	alpha: true
});
renderer.setSize(window.innerWidth + 10000, window.innerHeight + 10000);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 30, 0);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// renderer.setClearColor(0xffffff, 0);
scene.background = new THREE.Color(0xffffff);

const stats = Stats();
document.body.appendChild(stats.dom);

//CREATING BOARD (3E)
scene.add(beaconstart);
scene.add(beacontarget);

beaconstart.position.set(1000, 1000, 1000);
beacontarget.position.set(1000, 1000, 1000);


for (let r = -rows; r < rows; r++) {
	boardCoor.push([]);
	boardPath.push([]);
	for (let c = -cols; c < cols; c++) {
		boardCoor[r + rows].push(0);
		boardPath[r + rows].push([]);
		let shape = new THREE.Group();

		let cube = new THREE.Mesh(
			new THREE.BoxGeometry(width, height, width),
			new THREE.MeshBasicMaterial({
				color: 0xe1e1e1
			})
		);

		let outline = new THREE.Mesh(
			new THREE.BoxGeometry(width, height, width),
			new THREE.MeshBasicMaterial({
				color: 0x000000,
				side: THREE.BackSide
			})
		);

		cube.position.set(r * (width + 0.05), 0, c * (width + 0.05));
		outline.position.set(r * (width + 0.05), 0, c * (width + 0.05));
		outline.scale.multiplyScalar(1.05);

		shape.add(cube);
		shape.add(outline);

		board.push(cube);
		outlines.push(outline);
		group.add(shape);
	}
}
group.name = 'CUBE GROUP';
scene.add(group);

//------------------------------------------------------------------------------------------------------------------------------------

// ┏━━━┓┏┓ ┏┓┏━━┓
// ┃┏━┓┃┃┃ ┃┃┗┫┣┛
// ┃┃ ┗┛┃┃ ┃┃ ┃┃
// ┃┃┏━┓┃┃ ┃┃ ┃┃
// ┃┗┻━┃┃┗━┛┃┏┫┣┓
// ┗━━━┛┗━━━┛┗━━┛

//------------------------------------------------------------------------------------------------------------------------------------


let controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableRotate = true;
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.zoomSpeed = 1;
controls.rotateSpeed = 1;
controls.maxPolarAngle = Math.PI / 2;
controls.mouseButtons = {
	LEFT: THREE.MOUSE.RIGHT,
	MIDDLE: THREE.MOUSE.MIDDLE,
	RIGHT: THREE.MOUSE.LEFT
}

//------------------------------------------------------------------------------------------------------------------------------------
//Toggles between types of node - Selected Node
const toggleNode = (x) => {
	x = !x ? 1 : x;
	let cs = document.getElementsByClassName("c")[0];
	let labels = ["Start Node", "Target Node", "Wall Node", "Eraser"];
	let counter = 0;
	for (let i = 0; i < 4; i++) {
		if (labels[i] == cs.textContent) {
			counter = i;
			counter += x;
			break;
		}
	}
	cs.textContent = labels[counter % 4];
}

//------------------------------------------------------------------------------------------------------------------------------------
//Clears entire board
const clearAll = () => {
	if (progress) {
		return;
	}
	clearType(build);
	clearType(start);
	clearType(target);
	clearType(_path);
	clearType(visited);

	let cs = document.getElementsByClassName("c")[0];
	cs.textContent = "Start Node";
}

//------------------------------------------------------------------------------------------------------------------------------------
//Clears a given node type
const clearType = (type) => {
	if (progress) {
		return;
	}
	for (let i = 0; i < board.length; i++) {
		if (board[i].material.color.getHex() === type.material.color.getHex()) {
			if (type == start) {
				beaconstart.position.set(1000, 1000, 1000);
			}
			if (type == target) {
				beacontarget.position.set(1000, 1000, 1000);
			}
			board[i].scale.y = 1;
			board[i].material = ground.material;
			board[i].position.y = 0;
			outlines[i].scale.y = 1.05;
			outlines[i].position.y = 0;
		}
	}
}

//------------------------------------------------------------------------------------------------------------------------------------
// Clears Walls with clearType
const clearWall = () => {
	if (progress) {
		return;
	}
	clearType(build);
	let cs = document.getElementsByClassName("c")[0];
	cs.textContent = "Wall Node";
}

//------------------------------------------------------------------------------------------------------------------------------------
//Clears Visited and Path nodes
const clearPath = () => {
	if (progress) {
		return;
	}
	clearType(visited);
	clearType(_path);
}

//------------------------------------------------------------------------------------------------------------------------------------
//Resizes the 3D board - (10x10, 20x20, 30x30, 40x40)
const resizeBoard = (newRows) => {
	if (progress) {
		return;
	}
	boardCoor = [];
	outlines = [];
	board = [];
	boardPath = [];
	let selectedObject = scene.getObjectByName(group.name);
	scene.remove(selectedObject);
	let newGroup = new THREE.Group();
	for (let r = -newRows; r < newRows; r++) {
		boardCoor.push([]);
		boardPath.push([]);
		for (let c = -newRows; c < newRows; c++) {
			boardCoor[r + newRows].push(0);
			boardPath[r + newRows].push([]);
			let shape = new THREE.Group();

			let cube = new THREE.Mesh(
				new THREE.BoxGeometry(width, height, width),
				new THREE.MeshBasicMaterial({
					color: 0xe1e1e1
				})
			);

			let outline = new THREE.Mesh(
				new THREE.BoxGeometry(width, height, width),
				new THREE.MeshBasicMaterial({
					color: 0x000000,
					side: THREE.BackSide
				})
			);

			cube.position.set(r * (width + 0.05), 0, c * (width + 0.05));
			outline.position.set(r * (width + 0.05), 0, c * (width + 0.05));
			outline.scale.multiplyScalar(1.025);

			shape.add(cube);
			shape.add(outline);

			board.push(cube);
			outlines.push(outline);
			newGroup.add(shape);
		}
	}
	group = newGroup;
	group.name = 'CUBE GROUP';
	scene.add(group);
	rows = newRows;
	cols = rows;
}

//------------------------------------------------------------------------------------------------------------------------------------
// Object for GUI (The GUI API uses/needs objects)
let node = {
	toggle: toggleNode,
	clear: clearAll,
	clearWall: clearWall,
	clearPath: clearPath,
	Rows: rows * 2,
	Delay: 0.25,
}

//------------------------------------------------------------------------------------------------------------------------------------
// Shows the path recursively (so it updates in real time)
let pathCounter = 0;
const visualizePath = () => {
	pathCounter++;
	if (pathCounter + 1 >= path.length) {
		console.log('WORKS');
		progress = false;
		pathCounter = 0;
		path = [];
		return;
	}

	let node = path[pathCounter];
	board[((rows * 2) * node[1]) + node[0]].material = new THREE.MeshBasicMaterial({
		color: 0xfdd14b
	});
	setTimeout(() => {
		visualizePath();
	}, 100);
}

//------------------------------------------------------------------------------------------------------------------------------------
// Call the dfs method and handles the boilerplate things (getting the current board, reseting stuff)
const visualizeDFS = () => {
	if (progress) {
		return;
	}
	getBoard();
	clearPath();
	reset(boardPath, startCoor);
	if (node.Delay === 0) {
		quick_dfs(board, boardCoor, boardPath, startCoor, targetCoor, node.Rows);
	} else {
		dfs(board, boardCoor, boardPath, startCoor, targetCoor, node.Rows, node.Delay * 1000);
		progress = true;
	}
}

//------------------------------------------------------------------------------------------------------------------------------------
// Call the bfs method and handles the boilerplate things (getting the current board, reseting stuff)
const visualizeBFS = () => {
	if (progress) {
		return;
	}
	getBoard();
	clearPath();
	reset(boardPath, startCoor);
	if (node.Delay === 0) {
		quick_bfs(board, boardCoor, boardPath, startCoor, targetCoor, node.Rows);
	} else {
		bfs(board, boardCoor, boardPath, startCoor, targetCoor, node.Rows, node.Delay * 1000);
		progress = true;
	}

}

//------------------------------------------------------------------------------------------------------------------------------------
// Pathfinding Object for GUI (The GUI API uses/needs objects)
let pathfinding = {
	visualizeDFS: visualizeDFS,
	visualizeBFS: visualizeBFS,
}

//Primary GUI
const gui = new dat.GUI();
gui.width = 250;
gui.add(node, "toggle");
gui.add(node, "clear");
gui.add(node, "clearWall");
gui.add(node, "clearPath");
gui.open();

//Secondary GUI - The Algos
const algos = gui.addFolder("Algorithms");
algos.add(pathfinding, "visualizeDFS");
algos.add(pathfinding, "visualizeBFS");

//Tertiary GUI - The (customizable) Controls
const options = gui.addFolder("Controls");
options.add(controls, "autoRotate");
options.add(controls, "zoomSpeed", 0, 5, 0.01);
options.add(controls, "rotateSpeed", 0, 5, 0.01);
options.add(node, "Rows", 10, 40, 10);
options.add(node, "Delay", 0, 1.5, 0.05);

//------------------------------------------------------------------------------------------------------------------------------------
//Animate runs every frame - runs checks and updates stuff
let previousRows = rows;
const animate = function() {
	requestAnimationFrame(animate);

	if (node.Rows !== previousRows) {
		resizeBoard((node.Rows / 2));
	}
	if (!progress) {
		previousRows = node.Rows;
	}
	controls.update();
	stats.begin();
	renderer.render(scene, camera);
	stats.end();


	stats.update();
};

animate();

//------------------------------------------------------------------------------------------------------------------------------------

// ┏━━━┓┏┓  ┏┓┏━━━┓┏━┓ ┏┓┏━━━━┓┏━━━┓
// ┃┏━━┛┃┗┓┏┛┃┃┏━━┛┃┃┗┓┃┃┃┏┓┏┓┃┃┏━┓┃
// ┃┗━━┓┗┓┃┃┏┛┃┗━━┓┃┏┓┗┛┃┗┛┃┃┗┛┃┗━━┓
// ┃┏━━┛ ┃┗┛┃ ┃┏━━┛┃┃┗┓┃┃  ┃┃  ┗━━┓┃
// ┃┗━━┓ ┗┓┏┛ ┃┗━━┓┃┃ ┃┃┃  ┃┃  ┃┗━┛┃
// ┗━━━┛  ┗┛  ┗━━━┛┗┛ ┗━┛  ┗┛  ┗━━━┛

//------------------------------------------------------------------------------------------------------------------------------------

//Resizes the window - boilerplate
const windowResizeHanlder = () => {
	const {
		innerHeight,
		innerWidth
	} = window;
	renderer.setSize(innerWidth, innerHeight);
	camera.aspect = innerWidth / innerHeight;
	camera.updateProjectionMatrix();
};

windowResizeHanlder();
window.addEventListener('resize', windowResizeHanlder);

//------------------------------------------------------------------------------------------------------------------------------------
// Changes the captions of the buttons (instead of clearAll, this makes it Clear All)
let cs = document.getElementsByClassName("c")[0];
cs.textContent = "Start Node"
let labels = document.getElementsByTagName("span");
labels[0].textContent = "Selected Node";
labels[1].textContent = "Clear All";
labels[2].textContent = "Clear Walls";
labels[3].textContent = "Clear Path";
labels[4].textContent = "Visualize DFS";
labels[5].textContent = "Visualize BFS";
labels[6].textContent = "Auto Rotate";
labels[7].textContent = "Zoom Speed";
labels[8].textContent = "Rotate Speed";



//------------------------------------------------------------------------------------------------------------------------------------
//Runs when user clicks on tile - changes it to selected node
const click = (cube, type) => {
	let cubeType = "";
	switch (cube.material.color.getHex()) {
		case build.material.color.getHex():
			cubeType = "Wall Node";
			break;
		case start.material.color.getHex():
			cubeType = "Start Node";
			break;
		case target.material.color.getHex():
			cubeType = "Target Node";
			break;
		default:
			cubeType = "Ground";
	}
	let r = Math.round((2 * rows) * (rows + (cube.position.x / (width + 0.05))));
	let c = Math.round(cols + (cube.position.z / (width + 0.05)));
	if (cubeType == type) return;
	if (type === "Start Node") {
		clearType(start);
		cube.material = start.material;
		beaconstart.position.set(cube.position.x, cube.position.y+2.5, cube.position.z);
		cube.scale.y = 1;
		cube.position.y = 0;
		outlines[r + c].scale.y = 1.025;
		outlines[r + c].position.y = 0;
		// toggleNode();
	} else if (type === "Target Node") {
		clearType(target);
		cube.material = target.material;
		beacontarget.position.set(cube.position.x, cube.position.y+2.5, cube.position.z);
		cube.scale.y = 1;
		cube.position.y = 0;
		outlines[r + c].scale.y = 1.025;
		outlines[r + c].position.y = 0;
		// toggleNode();
	} else if (type === "Wall Node") {
		let rand = Math.floor(Math.random() * 3) + 2.5;
		let level = ((rand-1)*height)/2
		cube.scale.y = rand;
		cube.position.y = level;
		cube.material = build.material;
		outlines[r + c].scale.y = rand;
		outlines[r + c].position.y = level;
	} else {
		cube.material = ground.material;
		cube.scale.y = 1;
		cube.position.y = 0;
		outlines[r + c].scale.y = 1.025;
		outlines[r + c].position.y = 0;
	}
	if (type !== cubeType) {
		if (cubeType === "Start Node") {
			beaconstart.position.set(1000, 1000, 1000);
		}
		if (cubeType === "Target Node") {
			beacontarget.position.set(1000, 1000, 1000);
		}
	}
	board[r + c] = cube;
	clearPath();

	//    if (cubeType === "Start Node") {
	//        cs.textContent = cubeType;
	//    } else if (cubeType === "Target Node") {
	//        cs.textContent = cubeType;
	//    }

}

//------------------------------------------------------------------------------------------------------------------------------------
//Finds what tile user click on
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
const toggleWall = (event) => {
	if (progress) {
		return null;
	}
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);

	let intersects = raycaster.intersectObjects(board);

	if ((intersects.length > 0 && wall !== intersects[0].object)) {
		click(intersects[0].object, cs.textContent);
	}

	return intersects[0].object;

}

//------------------------------------------------------------------------------------------------------------------------------------
// This part just runs various checks for the toggleWall function
let wall = null;
let mouseDown = 0;
document.body.onmousedown = function(event) {
	if (event.button === 0) {
		++mouseDown;
		wall = toggleWall(event);
	}
}

document.body.onmouseup = function(event) {
	if (event.button === 0) {
		--mouseDown;
		wall = null;
	}
}

document.onkeydown = function(e) {
	switch (e.keyCode) {
		case 37:
			console.log('LEFT');
			toggleNode(2)
			break;
		case 39:
			console.log('RIGHT');
			toggleNode()
			break;
	}
};

document.addEventListener('mousemove', function(event) {
	if (mouseDown > 0) {
		wall = toggleWall(event);
	}
}, false);

//------------------------------------------------------------------------------------------------------------------------------------


// ┏━━━┓┏┓   ┏━━━┓┏━━━┓┏━━━┓
// ┃┏━┓┃┃┃   ┃┏━┓┃┃┏━┓┃┃┏━┓┃
// ┃┃ ┃┃┃┃   ┃┃ ┗┛┃┃ ┃┃┃┗━━┓
// ┃┗━┛┃┃┃ ┏┓┃┃┏━┓┃┃ ┃┃┗━━┓┃
// ┃┏━┓┃┃┗━┛┃┃┗┻━┃┃┗━┛┃┃┗━┛┃
// ┗┛ ┗┛┗━━━┛┗━━━┛┗━━━┛┗━━━┛

//------------------------------------------------------------------------------------------------------------------------------------

// Directions the program can go
const dirs = [
    [0, 1],
    [1, 0],
    [-1, 0],
    [0, -1]
];

// Queue for BFS
let queue = [];
// Stack for DFS
let stack = [];

//------------------------------------------------------------------------------------------------------------------------------------
// Resets the everythings needed for the algos
const reset = (boardPath, startCoor) => {
	queue = [startCoor];
	stack = [startCoor];
	boardPath[startCoor[0]][startCoor[1]].push(startCoor);
}


//------------------------------------------------------------------------------------------------------------------------------------
// Runs DFS (Depth First Search) recursively - not the most efficient, but needed for it to update in real time
const dfs = (board, boardCoor, boardPath, startCoor, targetCoor, rows, delay) => {
	if (!stack.length) {
		console.log('TARGET WAS NOT FOUND');
		visualizePath();
		return null;
	}

	let node = stack.pop();

	if (node[0] == targetCoor[0] && node[1] == targetCoor[1]) {
		console.log('TARGET WAS FOUND');
		console.log(boardPath[node[0]][node[1]]);
		path = boardPath[node[0]][node[1]];
		visualizePath();
		return boardPath[node[0]][node[1]];
	}

	if (!(node[0] === startCoor[0] && node[1] == startCoor[1])) {
		board[(rows * node[1]) + node[0]].material = new THREE.MeshBasicMaterial({
			color: 0x32c6db
		});
	}

	if (boardCoor[node[0]][node[1]] === 0) {
		boardCoor[node[0]][node[1]] = 2;
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
				stack.push(nextCoor);
			}
		}
	}

	let ret = setTimeout(() => {
		let _ret = dfs(board, boardCoor, boardPath, startCoor, targetCoor, rows, delay);
		if (_ret) {
			return _ret;
		}
	}, delay);
	return ret;

}

//------------------------------------------------------------------------------------------------------------------------------------
// Runs DFS (Depth First Search) - much faster, but doesn't update in real time (activates when delay is 0)
const quick_dfs = (board, boardCoor, boardPath, startCoor, targetCoor, rows) => {
	while (stack.length) {
		let node = stack.pop();
		if (node[0] == targetCoor[0] && node[1] == targetCoor[1]) {
			console.log('TARGET WAS FOUND');
			console.log(boardPath[node[0]][node[1]]);
			path = boardPath[node[0]][node[1]];
			visualizePath();
			return boardPath[node[0]][node[1]];
		}

		if (boardCoor[node[0]][node[1]] === 0) {
			boardCoor[node[0]][node[1]] = 2;
			if (!(node[0] === startCoor[0] && node[1] == startCoor[1])) {
				board[(rows * node[1]) + node[0]].material = new THREE.MeshBasicMaterial({
					color: 0x32c6db
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
					stack.push(nextCoor);
					boardPath[nextCoor[0]][nextCoor[1]] = boardPath[node[0]][node[1]].concat([nextCoor]);
				}
			}
		}
	}
	visualizePath();
	console.log('TARGET WAS NOT FOUND');
	return null;
}

//------------------------------------------------------------------------------------------------------------------------------------
// Runs BFS (Breadth First Search) recursively - not the most efficient, but needed for it to update in real time
const bfs = (board, boardCoor, boardPath, startCoor, targetCoor, rows, delay) => {
	if (!queue.length) {
		console.log('TARGET WAS NOT FOUND');
		visualizePath();
		return null;
	}
	let node = queue.pop();

	if (boardCoor[node[0]][node[1]] === 0) {
		boardCoor[node[0]][node[1]] = 2;
		if (node[0] == targetCoor[0] && node[1] == targetCoor[1]) {
			console.log('TARGET WAS FOUND');
			console.log(boardPath[node[0]][node[1]]);
			path = boardPath[node[0]][node[1]];
			visualizePath();
			return boardPath[node[0]][node[1]];
		}

		if (!(node[0] === startCoor[0] && node[1] == startCoor[1])) {
			board[(rows * node[1]) + node[0]].material = new THREE.MeshBasicMaterial({
				color: 0x32c6db
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
	}, delay);
	return ret;
}

//------------------------------------------------------------------------------------------------------------------------------------
// Runs BFS (Breadth First Search) - much faster, but doesn't update in real time (activates when delay is 0)
const quick_bfs = (board, boardCoor, boardPath, startCoor, targetCoor, rows) => {
	while (queue.length) {
		let node = queue.pop()

		if (node[0] == targetCoor[0] && node[1] == targetCoor[1]) {
			console.log('TARGET WAS FOUND');
			console.log(boardPath[node[0]][node[1]]);
			path = boardPath[node[0]][node[1]];
			visualizePath();
			return boardPath[node[0]][node[1]];
		}

		if (boardCoor[node[0]][node[1]] === 0) {
			boardCoor[node[0]][node[1]] = 2;
			if (!(node[0] === startCoor[0] && node[1] == startCoor[1])) {
				board[(rows * node[1]) + node[0]].material = new THREE.MeshBasicMaterial({
					color: 0x32c6db
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
	}
	visualizePath();
	console.log('TARGET WAS NOT FOUND');
	return null;
}
//------------------------------------------------------------------------------------------------------------------------------------
/*
 * index.js
 *
 * This is the file responsible for everything (basically).
 *
 */

import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.d.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import { dfs } from './algos.js';

//3D Pathfinding


//LETS
let group = new THREE.Group();
export let board = [];
let outlines = [];
let startCoor = [];
let targetCoor = [];
let boardCoor = [];
let rows = 10;
let cols = rows;

//CONSTS
const width = 1.5;
const height = width / 2;



const ground = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, width),
    new THREE.MeshBasicMaterial({ color: 0xe1e1e1 })
);

const build = new THREE.Mesh(
    new THREE.BoxGeometry(width, height + 1, width),
    new THREE.MeshBasicMaterial({ color: 0x6f6c6c})
);

const start = new THREE.Mesh(
    new THREE.BoxGeometry(width, height + 1, width),
    new THREE.MeshBasicMaterial({ color: 0x4fc134 })
);

const target = new THREE.Mesh(
    new THREE.BoxGeometry(width, height + 1, width),
    new THREE.MeshBasicMaterial({ color: 0xff2020 })
);

const weight = new THREE.Mesh(
    new THREE.BoxGeometry(width, height + 1, width),
    new THREE.MeshBasicMaterial({ color: 0x02abed })
);

const getBoard = () => {
    group.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) {
        return;
      } else if (node.material.side === THREE.BackSide) {
        return;
      }
      let r = Math.round(rows + (node.position.x / (width + 0.05)));
      let c = Math.round(cols + (node.position.z / (width + 0.05)));
      switch(board[((2 * rows) * r) + c].material.color.getHex()){
          case start.material.color.getHex():
                  startCoor = [r, c];
                  console.log(startCoor);
                  break;
          case target.material.color.getHex():
                  targetCoor = [r, c];
                  console.log(targetCoor);
                  break;
          case build.material.color.getHex():
                  boardCoor[r][c] = 1;
                  break;
          default:
                  boardCoor[r][c] = 0;
      }
    })
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 90, 0);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xffffff, 1);
renderer.setSize( window.innerWidth + 10000, window.innerHeight + 10000);
document.body.appendChild( renderer.domElement );

const stats = Stats();
document.body.appendChild(stats.dom);

for (let r = -rows; r < rows; r++) {
    boardCoor.push([]);
    for (let c = -cols; c < cols; c++) {
        boardCoor[r + rows].push(0);
        let shape = new THREE.Group();

        let cube = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, width),
            new THREE.MeshBasicMaterial({ color: 0xe1e1e1 })
        );

        let outline = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, width),
            new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide})
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




let controls = new OrbitControls( camera, renderer.domElement );
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





const toggleNode = () => {
    let cs = document.getElementsByClassName("c")[0];
    let labels = ["Start", "Target", "Wall", "Weighted"];
    let counter = 0;
    for(let i = 0; i < 4; i++) {
        if (labels[i] + " Node" == cs.textContent){
            counter = i;
            counter++;
            break;
        }
    }
    cs.textContent = labels[counter % 4] + " Node";
}

const clearAll = () => {
    for(let i = 0; i < board.length; i++) {
       board[i].scale.y = 1;
       board[i].material = ground.material;
       board[i].position.y = 0;
       outlines[i].scale.y = 1.05;
       outlines[i].position.y = 0;
    }
    let cs = document.getElementsByClassName("c")[0];
    cs.textContent = "Start Node";
}

const clearType = (type) => {
    for(let i = 0; i < board.length; i++) {
        if (board[i].material.color.getHex() === type.material.color.getHex()) {
           board[i].scale.y = 1;
           board[i].material = ground.material;
           board[i].position.y = 0;
           outlines[i].scale.y = 1.05;
           outlines[i].position.y = 0;
        }
    }
}

const clearWall = () => {
    clearType(build);
    clearType(weight);
    let cs = document.getElementsByClassName("c")[0];
    cs.textContent = "Wall Node";
}

const resizeBoard = (newRows) => {
  board = []
  outlines = []
  board = [];
  let selectedObject = scene.getObjectByName(group.name);
  scene.remove( selectedObject );
  let newGroup = new THREE.Group();
  for (let r = -newRows; r < newRows; r++) {
      boardCoor.push([]);
      for (let c = -newRows; c < newRows; c++) {
          boardCoor[r + rows].push(0);
          let shape = new THREE.Group();

          let cube = new THREE.Mesh(
              new THREE.BoxGeometry(width, height, width),
              new THREE.MeshBasicMaterial({ color: 0xe1e1e1 })
          );

          let outline = new THREE.Mesh(
              new THREE.BoxGeometry(width, height, width),
              new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide})
          );

          cube.position.set(r * (width + 0.05), 0, c * (width + 0.05));
          outline.position.set(r * (width + 0.05), 0, c * (width + 0.05));
          outline.scale.multiplyScalar(1.05);

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


let node = {
    toggle: toggleNode,
    clear: clearAll,
    clearWall: clearWall,
    rows: rows*2,
    diagonal: false
}


const visualizeDFS = (type) => {
  getBoard();
  dfs(board, boardCoor, startCoor, targetCoor, node.diagonal, node.rows);
}

let pathfinding = {
  visualizeDFS: visualizeDFS
}

const gui = new dat.GUI();
gui.add(node, "toggle");
gui.add(node, "clear");
gui.add(node, "clearWall");
gui.add(node, "diagonal");
gui.add(pathfinding, "visualizeDFS");
gui.open();

const options = gui.addFolder("Controls");
options.add(controls, "autoRotate");
options.add(controls, "autoRotateSpeed", 0, 5, 0.01);
options.add(controls, "zoomSpeed", 0, 5, 0.01);
options.add(controls, "rotateSpeed", 0, 5, 0.01);
options.add(node, "rows", 10, 40, 10);

let previousRows = rows;

const animate = function () {
    requestAnimationFrame( animate );

    if (node.rows !== previousRows) {
      resizeBoard((node.rows/2));
    }
    previousRows = node.rows;
    controls.update();
    stats.begin();
    renderer.render( scene, camera );
    stats.end();


    stats.update();
};

animate();

const windowResizeHanlder = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};

windowResizeHanlder();
window.addEventListener('resize', windowResizeHanlder);




let cs = document.getElementsByClassName("c")[0];
cs.textContent = "Start Node"
let labels = document.getElementsByTagName("span");
labels[0].textContent = "Selected Node";
labels[1].textContent = "Clear All";
labels[2].textContent = "Clear Walls";

const click = (cube, type) => {
    let cubeType = "";
    switch (cube.material.color.getHex()) {
        case build.material.color.getHex():
            cubeType = "Wall Node";
            break;
        case weight.material.color.getHex():
            cubeType = "Weighted Node";
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
    if( cube.material.color.getHex() === ground.material.color.getHex() || cubeType !== type ) {
        if (type === "Start Node") {
            clearType(start);
            cube.material = start.material;
            cube.scale.y = 1;
            cube.position.y = 0;
            outlines[r + c].scale.y = 1.05;
            outlines[r + c].position.y = 0;
//            toggleNode();
        } else if (type === "Target Node") {
            clearType(target);
            cube.material = target.material;
            cube.scale.y = 1;
            cube.position.y = 0;
            outlines[r + c].scale.y = 1.05;
            outlines[r + c].position.y = 0;
//            toggleNode();
        } else {
            if (type === "Wall Node") {
                cube.material = build.material;
            } else if (type === "Weighted Node") {
                cube.material = weight.material;
            }
            const rand = Math.floor(Math.random() * 3.5) + 2.5;
            cube.scale.y = rand;
            cube.position.y = 1;
            outlines[r + c].scale.y = rand;
            outlines[r + c].position.y = 1;
        }
    } else {
        cube.material = ground.material;
        cube.scale.y = 1;
        cube.position.y = 0;
        outlines[r + c].scale.y = 1.05;
        outlines[r + c].position.y = 0;
    }
    board[r + c] = cube;

//    if (cubeType === "Start Node") {
//        cs.textContent = cubeType;
//    } else if (cubeType === "Target Node") {
//        cs.textContent = cubeType;
//    }

}



let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

const toggleWall = (event) => {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

	let intersects = raycaster.intersectObjects( board );

	if ( (intersects.length > 0 && wall !== intersects[0].object) ) {
	    click(intersects[0].object, cs.textContent);
	}

  return intersects[0].object;

}

let wall = null;
let mouseDown = 0;

document.body.onmousedown = function(event) {
    if(event.button === 0) {
        ++mouseDown;
        wall = toggleWall(event);
    }
}
document.body.onmouseup = function(event) {
    if(event.button === 0) {
        --mouseDown;
        wall = null;
    }
}

document.addEventListener( 'mousemove', function( event ) {
    if (mouseDown > 0) {
        wall = toggleWall(event);
    }
}
, false );

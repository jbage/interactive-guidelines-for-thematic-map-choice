import './style.css'

import * as THREE from 'three';

import {FirstPersonControls} from 'three/examples/jsm/controls/FirstPersonControls.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById("scene").appendChild(renderer.domElement);

camera.position.setZ(30);

const camControls = new FirstPersonControls(camera, renderer.domElement);
camControls.lookSpeed = 0.4;
camControls.movementSpeed = 20;
camControls.noFly = true;
camControls.lookVertical = true;
camControls.constrainVertical = true;
camControls.verticalMin = 1.0;
camControls.verticalMax = 2.0;


const geometry = new THREE.BoxGeometry(10,10,10);
const material = new THREE.MeshBasicMaterial({color: 0xFF6347});
const box = new THREE.Mesh(geometry, material);
scene.add(box);

const gridHelper = new THREE.GridHelper(200,50);
scene.add(gridHelper);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25);
const material = new THREE.MeshStandardMaterial({color: 0xFFFFFF });
const star = new THREE.Mesh(geometry,material);

const [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
star.position.set(x,y,z);
scene.add(star);
}
Array(200).fill().forEach(addStar);

function animate(){
  requestAnimationFrame(animate);
  box.rotation.x +=0.001;
  box.rotation.y +=0.001;
  renderer.render(scene,camera);
  //camControls.update();
}

animate()
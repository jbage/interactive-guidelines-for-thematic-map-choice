//Global variables
let leafArray=[];
let nodeArray=[]; 


//Initialize ThreeJS
var scene = new THREE.Scene();

var cam = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer({antialias: true});

scene.background = new THREE.Color(0xfafafa);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

cam.position.z = 20;
cam.position.y = 0;

document.getElementById("scene").appendChild(renderer.domElement);

var directionalLight = new THREE.DirectionalLight({color: 0xFFFFFF, intensity: 100});
directionalLight.position.set (0, 1, 0);
directionalLight.castShadow = true;
scene.add(directionalLight);

var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
//Initialize ThreeJS


let gridHelper = new THREE.GridHelper(100,20, 0x0a0a0a, 0x0a0a0a);
gridHelper.position.set (0,-0.5,0);
scene.add(gridHelper);

//Camera Controls
let controls = new THREE.PointerLockControls(cam, renderer.domElement);
let clock = new THREE.Clock();

let lockButton = document.querySelector("#lockButton");
lockButton.addEventListener('click',()=>{
    controls.lock();
});
let example1Button = document.querySelector("#example1Button");
example1Button.addEventListener('click',()=>{
    createObjects("algorithm_auriol.json");
    document.getElementById("selectDecisionTree").style.visibility ="hidden";
});

let example2Button = document.querySelector("#example2Button");
example2Button.addEventListener('click',()=>{
    createObjects("common-thematic-map-types.json");
    document.getElementById("selectDecisionTree").style.visibility ="hidden";
});

let keyboard = [];
addEventListener('keydown',(e)=>{
    keyboard[e.key] = true;
});
addEventListener('keyup',(e)=>{
    keyboard[e.key] = false;
});

function processKeyboard(delta){
    let speed = 5;
    let actualSpeed = speed * delta;
    if (keyboard['w']){
        controls.moveForward(actualSpeed);
    }
    if (keyboard['s']){
        controls.moveForward(-actualSpeed);
    }
    if (keyboard['a']){
        controls.moveRight(-actualSpeed);
    }
    if (keyboard['d']){
        controls.moveRight(actualSpeed);
    }
}
//Camera Controls

//load JSON
function loadJSON(file,callback) {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType('application/json');
    xobj.open('GET', file, true); 
    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == '200') {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
        callback(xobj.responseText);
       }
    };
    xobj.send(null);  
  }
 //load JSON

//create spheres from leaf-nodes
function createObjects(jsonFile){
loadJSON(jsonFile, function(text){
    let jsonData = JSON.parse(text);
    let jsonNodes = jsonData.graph.nodes;
    let i;
    let highlight = false;
    //extracting leaf-nodes into leafArray
    for (i = 0; i<jsonNodes.length; i++)
    {
        if (jsonNodes[i].type == "leaf")
        {
        leafArray.push(jsonNodes[i]);
        }
    }
    //defining positions of objects
    let startPoint = leafArray.length * 2.5 - 2.5;
    //creating spheres from leafArray
    for(i = 0; i < leafArray.length; i++){
        let positionX = i * 5 - startPoint;
        let positionZ = positionX * positionX * 0.05;
        generateSphere([positionX,positionZ],leafArray[i].path, highlight);
        //generateBox([position,0.5,1],leafArray[i].path, highlight);
    }


});
}
//create spheres from leaf-nodes

//extract nodes into array
function createSelectionArea(jsonFile){
loadJSON(jsonFile, function(text){
    let jsonData = JSON.parse(text);
    let jsonNodes = jsonData.graph.nodes;
    let i;
    for (i = 0; i<jsonNodes.length; i++)
    {
        if (jsonNodes[i].type == "node")
        {
        nodeArray.push(jsonNodes[i]);
        }
    }
    console.log(nodeArray);
});
}
//extract nodes into array

//generate Box
function generateBox(position, picture, highlight) {
    let value;
    if (highlight){
        value = 2;
    }
    else{
        value = 1;
    }
    let boxTexture = new THREE.TextureLoader().load(picture);
    let boxGeometry = new THREE.BoxGeometry(value, value, value);
    let boxMaterial = new THREE.MeshBasicMaterial({ map: boxTexture });
    let box = new THREE.Mesh(boxGeometry, boxMaterial);
    //defining positioning of box
    box.position.set(position[0], value/2, position[1])
    scene.add(box);
}
//generate Box

//generate Sphere
function generateSphere(position, picture, highlight){
    let value;
    if (highlight){
        value = 2;
    }
    else{
        value = 1;
    }
    //defining texture of sphere
    let sphereTexture = new THREE.TextureLoader().load(picture);
    //defining geometry of sphere
    let sphereGeometry = new THREE.SphereGeometry(value);
    let sphereMaterial = new THREE.MeshBasicMaterial( {map: sphereTexture});
    let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    //defining positioning of sphere
    sphere.position.set(position[0], value/2, position[1])
    scene.add(sphere);
    console.log(sphere.position.x);
    console.log(sphere.position.z);
    } 

//render function
function drawScene() {
renderer.render(scene, cam);
let delta = clock.getDelta();
processKeyboard(delta);
requestAnimationFrame(drawScene);
}
drawScene();
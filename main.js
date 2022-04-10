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

cam.position.z = 0;
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
    document.getElementById("lockButton").style.display="block";
});

let example2Button = document.querySelector("#example2Button");
example2Button.addEventListener('click',()=>{
    createObjects("common-thematic-map-types.json");
    document.getElementById("selectDecisionTree").style.visibility ="hidden";
    document.getElementById("lockButton").style.display="block";

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
    let radioButton1 = document.querySelectorAll('input[name="positioning"]');
    let radioButton2 = document.querySelectorAll('input[name="object"]');
    let selectedSize;
    for (const radioButton of radioButton1) {
        if (radioButton.checked) {
            selectedSize = radioButton.value;
        }
    }
    let selectedObject;
    for (const radioButton of radioButton2) {
        if (radioButton.checked) {
            selectedObject = radioButton.value;
        }
    }

    //extracting leaf-nodes into leafArray
    for (i = 0; i < jsonNodes.length; i++)
    {
        if (jsonNodes[i].type == "leaf")
        {
        leafArray.push(jsonNodes[i]);
        }
    }
    //if the user chooses to arrange objects in a straight way
    if (selectedSize == "straight"){
        //defining positions of objects
        //startPoint variable to define where the positioning of objects starts. It is dependant of the qunatity of objects
        let startPoint = leafArray.length * 3;
        //variable to define the distance between the objects. This is also dependant of the quantity of objects
        let positionHelper = leafArray.length * 6 / (leafArray.length - 1)
        //creating spheres from leafArray
        for(i = 0; i < leafArray.length; i++){
            let positionX = i * positionHelper - startPoint;
            let positionZ = -startPoint;
            if(selectedObject == "sphere"){
                generateSphere([positionX,positionZ],leafArray[i].path, highlight);
            }
            else{
                generateBox([positionX,positionZ],leafArray[i].path, highlight);
            }
        }
    }
    //if the user chooses to arrange objects in a circular way
    if (selectedSize == "circular"){
        //defining positions of objects
        //variable to define the distance between objects. Since it is a circular positioning it is defined in degrees
        let positionHelper = 90/(leafArray.length-1);
        //variable to define the distance of the objects to the camera. Dependant to qunaitity of objects to ensure that the space between objects stays large enough and the overview is secured
        let radius = leafArray.length * 3;
        //startpoint also in degrees. Starting with 225 since the coordinates will be calculated from the radius and the counterclockwise angle from the positive x axis
        let startPoint = 225;
        for(i = 0; i < leafArray.length; i++){
            let positionX = radius * getCosFromDegrees(startPoint + (i * positionHelper));
            let positionZ = radius * getSinFromDegrees(startPoint + (i * positionHelper));
            if(selectedObject == "sphere"){
                generateSphere([positionX,positionZ],leafArray[i].path, highlight);
            }
            else{
                generateBox([positionX,positionZ],leafArray[i].path, highlight);
            }
        }
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
    let boxGeometry = new THREE.BoxGeometry(value*2, value*2, value*2);
    let boxMaterial = new THREE.MeshBasicMaterial({ map: boxTexture });
    let box = new THREE.Mesh(boxGeometry, boxMaterial);
    //defining positioning of box
    box.position.set(position[0], value/2, position[1]);
    box.lookAt(cam.position);
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
    sphere.position.set(position[0], value/2, position[1]);
    sphere.lookAt(cam.position);
    scene.add(sphere);
    }

function generateText(){
    
}

//help function to calculate Cosinus from degrees    
function getCosFromDegrees(degrees) {
    return Math.cos(degrees / 180 * Math.PI);    
}
//help function to calculate Sinus from degrees   
function getSinFromDegrees(degrees) {
    return Math.sin(degrees / 180 * Math.PI);    
}

//render function
function drawScene() {
renderer.render(scene, cam);
let delta = clock.getDelta();
processKeyboard(delta);
requestAnimationFrame(drawScene);
}
drawScene();

//Global variables
let leafArray=[];
let nodeArray=[]; 


//Initialize ThreeJS
var scene = new THREE.Scene();

var cam = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer({antialias: true});

scene.background = new THREE.Color(0xfafafa);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

//setting up position for camera
cam.position.y = 0.5;

document.getElementById("scene").appendChild(renderer.domElement);

//adding directional light to the scene
var directionalLight = new THREE.DirectionalLight({color: 0xFFFFFF, intensity: 100});
directionalLight.position.set (0, 1, 0);
directionalLight.castShadow = true;
scene.add(directionalLight);

//adding ambient light to the scene
var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
//Initialize ThreeJS

//setting up a grid for orientation
let gridHelper = new THREE.GridHelper(100,20, 0x0a0a0a, 0x0a0a0a);
gridHelper.position.set (0,-0.5,0);
scene.add(gridHelper);

//setting up the camera controls
let controls = new THREE.PointerLockControls(cam, renderer.domElement);
let clock = new THREE.Clock();

//event listener for lock-button causing the mouse to be locked and used as camera control for the scene
let lockButton = document.querySelector("#lockButton");
lockButton.addEventListener('click',()=>{
    controls.lock();
});

controls.addEventListener('lock',()=>{
    lockButton.innerHTML = "Press ESC to Unlock";
})
controls.addEventListener('unlock',()=>{
    lockButton.innerHTML = "Click to Lock";
})

//event listener for example-button1 which will load the first example decision tree
let example1Button = document.querySelector("#example1Button");
example1Button.addEventListener('click',()=>{
    createObjects("algorithm_auriol.json");
    //hide selection area of decision trees
    document.getElementById("selectDecisionTree").style.visibility ="hidden";
    //show button to lock controls
    document.getElementById("lockButton").style.display="block";
});

//event listener for example-button2 which will load the second example decision tree
let example2Button = document.querySelector("#example2Button");
example2Button.addEventListener('click',()=>{
    createObjects("common-thematic-map-types.json");
    //hide selection area of decision trees
    document.getElementById("selectDecisionTree").style.visibility ="hidden";
    //show button to lock controls
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
    let highlight = true;
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
        let positionHelper = startPoint * 2 / (leafArray.length - 1)
        //creating spheres from leafArray
        for(i = 0; i < leafArray.length; i++){
            let positionX = i * positionHelper - startPoint;
            let positionZ = -startPoint*2;
            let name = leafArray[i].name;
            if(selectedObject == "sphere"){
                generateSphere([positionX,positionZ],leafArray[i].im-path, highlight, name);
            }
            else{
                generateBox([positionX,positionZ],leafArray[i].path, highlight, name);
            }
        }
    }
    //if the user chooses to arrange objects in a circular way
    if (selectedSize == "circular"){
        //defining positions of objects
        //variable to define the distance between objects. Since it is a circular positioning it is defined in degrees
        let positionHelper = 90/(leafArray.length-1);
        //variable to define the distance of the objects to the camera. Dependant to qunaitity of objects to ensure that the space between objects stays large enough and the overview is secured
        let radius = leafArray.length * 8;
        //startpoint also in degrees. Starting with 225 since the coordinates will be calculated from the radius and the counterclockwise angle from the positive x axis
        let startPoint = 225;
        for(i = 0; i < leafArray.length; i++){
            let positionX = radius * getCosFromDegrees(startPoint + (i * positionHelper));
            let positionZ = radius * getSinFromDegrees(startPoint + (i * positionHelper));
            let name = leafArray[i].name;
            if(selectedObject == "sphere"){
                generateSphere([positionX,positionZ],leafArray[i].path, highlight, name);
            }
            else{
                generateBox([positionX,positionZ],leafArray[i].path, highlight, name);
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
/**
 * Creates a box and adds it to the scene
 * @param {Array} position Array containing the x- and z-coordinate of the box 
 * @param {String} picture path of the image-data which will be used as texture for the box
 * @param {boolean} highlight indicates if the object fits to the users choices (from the decision tree) and thus will be highlighted
 */
function generateBox(position, picture, highlight, name) {
    let value;
    if (highlight){
        value = 2;
    }
    else{
        value = 1;
    }
    //creating box with texture, geometry and material
    let boxTexture = new THREE.TextureLoader().load(picture);
    let boxGeometry = new THREE.BoxGeometry(value*2, value*2, value*2);
    let boxMaterial = new THREE.MeshBasicMaterial({ map: boxTexture });
    let box = new THREE.Mesh(boxGeometry, boxMaterial);
    //setting position of the box
    box.position.set(position[0], value/2, position[1]);
    //facing the camera
    //box.lookAt(cam.position);
    //adding box to the scene
    scene.add(box);
    generateText(name, position, value);
}
//generate Box

//generate Sphere
/**
 * Creates a sphere and adds it to the scene
 * @param {Array} position Array containing the x- and z-coordinate of the box 
 * @param {String} picture path of the image-data which will be used as texture for the sphere
 * @param {boolean} highlight indicates if the object fits to the users choices (from the decision tree) and thus will be highlighted
 */
function generateSphere(position, picture, highlight, name){
    let value;
    if (highlight){
        value = 2;
    }
    else{
        value = 1;
    }
    //creating sphere with texture, geometry and material
    let sphereTexture = new THREE.TextureLoader().load(picture);
    let sphereGeometry = new THREE.SphereGeometry(value);
    let sphereMaterial = new THREE.MeshBasicMaterial( {map: sphereTexture});
    let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    //setting position of sphere
    sphere.position.set(position[0], value/2, position[1]);
    //mesh of sphere facing camera
    sphere.lookAt(cam.position);
    //adding sphere to the scene
    scene.add(sphere);
    generateText(name, position, value);
    }

function generateText(name,position,value){
    let loader = new THREE.FontLoader();
    let nameString = String(name);
    loader.load('node_modules/three/examples/fonts/droid/droid_sans_bold.typeface.json', function (font){
        let textGeometry = new THREE.TextGeometry(nameString,{
            font: font,
            size: 0.5,
            height: 0.1
    });
    let textMesh = new THREE.Mesh(textGeometry, [
        new THREE.MeshPhongMaterial({color: 0xad4000}), 
        new THREE.MeshPhongMaterial({color: 0x5c2301})]);
    //creating a bounding box of the text to measure the size (for positioning later)
    let boundingBox = new THREE.Box3().setFromObject(textMesh);
    //correcting the position of text so it is placed in the middle of the object (x-wise) and not starting there
    let correctedPosition = position[0]- (textMesh.geometry.boundingBox.max.x - textMesh.geometry.boundingBox.min.x)/2;
    textMesh.position.set(correctedPosition,value*2,position[1]);
    //textMesh.lookAt(cam.position);
    scene.add(textMesh);
    }
)
}

//help function to calculate cosinus from degrees    
function getCosFromDegrees(degrees) {
    return Math.cos(degrees / 180 * Math.PI);    
}
//help function to calculate sinus from degrees   
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
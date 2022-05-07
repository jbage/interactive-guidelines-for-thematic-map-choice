

//Global variables
let leafArray=[];
let nodeArray=[]; 


//Initialize ThreeJS
var scene = new THREE.Scene();
var cam = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({antialias: true});
scene.background = new THREE.Color(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
//setting up position for camera
cam.position.y = 0.5;
document.getElementById("scene").appendChild(renderer.domElement);

/*adding spot ligth to the scene
var spotLight = new THREE.SpotLight({color: 0xFFFFFF, intensity: 100});
spotLight.position.set (0,0,0);
spotLight.target = cam;
spotLight.castShadow = true;
scene.add(spotLight); */

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
lockButton.addEventListener('click',()=>
{
    controls.lock();
});

controls.addEventListener('lock',()=>
{
    lockButton.innerHTML = "Press ESC to Unlock";
})
controls.addEventListener('unlock',()=>
{
    lockButton.innerHTML = "Click to Lock";
})

//event listener for example-button1 which will load the first example decision tree
let example1Button = document.querySelector("#example1Button");
example1Button.addEventListener('click',()=>
{
    createSelectionArea("1_adaptive-maps-algorithm.json");
    createLeaves("1_adaptive-maps-algorithm.json");
    //hide selection area of decision trees
    document.getElementById("selectDecisionTree").style.visibility ="hidden";
    //show button to lock controls
    document.getElementById("lockButton").style.display="block";
});

//event listener for example-button2 which will load the second example decision tree
let example2Button = document.querySelector("#example2Button");
example2Button.addEventListener('click',()=>
{
    createSelectionArea("2_common-thematic-map-types.json");
    createLeaves("2_common-thematic-map-types.json");
    //hide selection area of decision trees
    document.getElementById("selectDecisionTree").style.visibility ="hidden";
    //show button to lock controls
    document.getElementById("lockButton").style.display="block";

});

let keyboard = [];
addEventListener('keydown',(e)=>
{
    keyboard[e.key] = true;
});
addEventListener('keyup',(e)=>
{
    keyboard[e.key] = false;
});

function processKeyboard(delta)
{
    let speed = 5;
    let actualSpeed = speed * delta;
    if (keyboard['w'])
    {
        controls.moveForward(actualSpeed);
    }
    if (keyboard['s'])
    {
        controls.moveForward(-actualSpeed);
    }
    if (keyboard['a'])
    {
        controls.moveRight(-actualSpeed);
    }
    if (keyboard['d'])
    {
        controls.moveRight(actualSpeed);
    }
}
//Camera Controls

//load JSON
function loadJSON(file,callback) 
{   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType('application/json');
    xobj.open('GET', file, true); 
    xobj.onreadystatechange = function () 
    {
        if (xobj.readyState == 4 && xobj.status == '200') 
        {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);  
}

//create spheres from leaf-nodes
function createLeaves(jsonFile)
{
    loadJSON(jsonFile, function(text)
    {
        let id;
        let jsonData = JSON.parse(text);
        let jsonNodes = jsonData.graph.nodes;
        let i;
        let highlight = true;
        let radioButton1 = document.querySelectorAll('input[name="positioning"]');
        let radioButton2 = document.querySelectorAll('input[name="object"]');
        let selectedSize;
        for (const radioButton of radioButton1) 
        {
            if (radioButton.checked) {
                selectedSize = radioButton.value;
            }
        }
        let selectedObject;
        for (const radioButton of radioButton2) 
        {
            if (radioButton.checked) {
                selectedObject = radioButton.value;
            }
        }
        //extracting leaf-nodes into leafArray
        for (i = 0; i < jsonNodes.length; i++)
        {
            //only choose the leaves
            if (jsonNodes[i].type == "leaf")
            {
            //add all leaves to leafArray
            leafArray.push(jsonNodes[i]);
            }
        }
        //if the user chooses to arrange objects in a straight way
        if (selectedSize == "straight") 
        {
            //startPoint variable to define where the positioning of objects starts. It is dependant of the qunatity of objects
            let startPoint = leafArray.length * 3;
            //variable to define the distance between the objects. This is also dependant of the quantity of objects
            let positioncurrentId = startPoint * 2 / (leafArray.length - 1)
            //loop setting positions for each leaf and running function to create the chosen object
            for(i = 0; i < leafArray.length; i++)
            {
                let positionX = i * positioncurrentId - startPoint;
                let positionZ = -startPoint*2;
                let name = leafArray[i].name;
                id = leafArray[i].id;
                if(selectedObject == "sphere")
                {
                    generateSphere([positionX,positionZ],leafArray[i].imgpath, highlight, name, id);
                }
                else
                {
                    generateBox([positionX,positionZ],leafArray[i].imgpath, highlight, name, id);
                }
            }
        }
        //if the user chooses to arrange objects in a circular way
        if (selectedSize == "circular")
        {
            //defining positions of objects
            //variable to define the distance between objects. Since it is a circular positioning it is defined in degrees
            let positioncurrentId = 90/(leafArray.length-1);
            //variable to define the distance of the objects to the camera. Dependant to qunaitity of objects to ensure that the space between objects stays large enough and the overview is secured
            let radius = leafArray.length * 8;
            //startpoint also in degrees. Starting with 225 since the coordinates will be calculated from the radius and the counterclockwise angle from the positive x axis
            let startPoint = 225;
            //loop setting positions for each leaf and running function to create the chosen object
            for(i = 0; i < leafArray.length; i++)
            {
                let positionX = radius * getCosFromDegrees(startPoint + (i * positioncurrentId));
                let positionZ = radius * getSinFromDegrees(startPoint + (i * positioncurrentId));
                let name = leafArray[i].name;
                id = leafArray[i].id;
                if(selectedObject == "sphere")
                {
                    generateSphere([positionX,positionZ],leafArray[i].imgpath, highlight, name, id);
                }
                else
                {
                generateBox([positionX,positionZ],leafArray[i].imgpath, highlight, name, id);
                }
            }
        }
    });
}

//extract nodes into array
function createSelectionArea(jsonFile)
{
    loadJSON(jsonFile, function(text)
    {
        let jsonData = JSON.parse(text);
        let jsonNodes = jsonData.graph.nodes;
        let jsonEdges = jsonData.graph.edges;
        let i;
        for (i = 0; i<jsonNodes.length; i++)
        {
            if (jsonNodes[i].type == "node" || jsonNodes[i].type == "root")
            {
                nodeArray.push(jsonNodes[i]);
            }
        }
        /*for (i = 0; i<jsonNodes.length; i++)
        {
            if (jsonNodes[i].type == "leaf")
            {
                leafArray.push(jsonNodes[i]);
            }
        }*/
        parametersToSections(nodeArray, jsonEdges);
        nodesToRadioButtons(nodeArray, jsonEdges);
        //createLeaves(leafArray, jsonEdges);
        document.getElementById("selectionArea").style.display ="block";
    });

}

function parametersToSections(nodeArray, edgesArray)
{
    let currentId;
    let i;
    let j;
    for(i = 0; i < nodeArray.length; i++)
        {
            currentId = nodeArray[i].id;
            for(j = 0; j < edgesArray.length; j++)
            {
                if(edgesArray[j].target == nodeArray[i].id && edgesArray[j].type == "parameter")
                {
                    let parameter = document.createElement("div");
                    parameter.id = currentId;
                    let headline = document.createElement("h3");
                    headline.id = nodeArray[i].name;
                    headline.innerHTML = nodeArray[i].name;
                    parameter.appendChild(headline);
                    document.getElementById("selectionForm").appendChild(parameter);
                }
            }
        }
}
//generate Box
/**
 * Converts the notes of the decision tree into radio buttons
 * @param {Array} nodeArray Array containing all nodes from the decision tree (without leaves and root)
 * @param {Array} edgesArray Array containing all edges from the decision tree
 */
function nodesToRadioButtons(nodeArray, edgesArray)
{
    //counter variables
    let i;
    let j;
    //placeholder for the id of the current chosen object
    let currentId;
    //iterating through the nodeArray
    for(i = 0; i < nodeArray.length; i++)
        {
            currentId = nodeArray[i].id;
            //iterating through the edgesArray
            for(j = 0; j < edgesArray.length; j++)
            {
                //if a superclass relation is targeting the node it has to be created as radiobutton
                if(edgesArray[j].source == currentId && edgesArray[j].type == "superclass")
                {
                    //creating the radiobutton and adding it to the HTML
                    let radiobutton = document.createElement("input");
                    radiobutton.type = "radio";
                    radiobutton.id = edgesArray[j].target;
                    radiobutton.name = edgesArray[j].source;
                    radiobutton.value = edgesArray[j].target;
                    //add onclick-event to radiobuttons to receive current user choice
                    radiobutton.onclick = function() 
                    {
                        changeRadioButtons(this.name);
                    }
                    radiobutton.classList.add("form-check-input");
                    //adding a label for the radiobutton
                    let label = document.createElement("label");
                    label.for = edgesArray[j].target;
                    label.classList.add("form-check-label");
                    label.innerHTML = nodeArray[edgesArray[j].target].name;
                    //check if there are any radiobuttons created yet
                    if(document.getElementById(currentId).tagName == "DIV")
                    {
                        //no radiobuttons yet, thus we have to address the div itself
                        document.getElementById(currentId).appendChild(radiobutton);
                        document.getElementById(currentId).appendChild(label);
                    }
                    else
                    {
                        //already radiobuttons created before, thus we can find the right div via parent node of these
                        radiobutton.disabled = true;
                        document.getElementById(currentId).parentNode.appendChild(radiobutton);
                        document.getElementById(currentId).parentNode.appendChild(label);
                    }
                }
            }
            //Line break after a group of Radiobuttons
            //check if there was already a radio button created yet and no line break was created after the last radiobutton
            if(document.getElementById(currentId) !== null && document.getElementById(currentId).parentNode.lastChild.tagName != "BR")
            {
                //create a line break
                document.getElementById(currentId).parentNode.appendChild(document.createElement("br"));
            }
        }

}

//generate Box
/**
 * Creates a box and adds it to the scene
 * @param {Array} position Array containing the x- and z-coordinate of the box 
 * @param {String} picture path of the image-data which will be used as texture for the box
 * @param {boolean} highlight indicates if the object fits to the users choices (from the decision tree) and thus will be highlighted
 * @param {String} name name of the object which will be used to create text object above the box
 * @param {Integer} id id of the object
 */
function generateBox(position, picture, highlight, name, id) 
{
    let value;
    if (highlight)
    {
        value = 2;
    }
    else
    {
        value = 1;
    }
    //creating box with texture, geometry and material
    let boxTexture = new THREE.TextureLoader().load(picture);
    let boxGeometry = new THREE.BoxGeometry(value*2, value*2, value*2);
    let boxMaterial = new THREE.MeshBasicMaterial({ map: boxTexture });
    let box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.name= name;
    box.userData.id = id;
    //setting position of the box
    box.position.set(position[0], value/2, position[1]);
    //facing the camera
    //box.lookAt(cam.position);
    //adding box to the scene
    scene.add(box);
    generateText(name, position, highlight, id);
}

//generate Sphere
/**
 * Creates a sphere and adds it to the scene
 * @param {Array} position Array containing the x- and z-coordinate of the box 
 * @param {String} picture path of the image-data which will be used as texture for the sphere
 * @param {Boolean} highlight indicates if the object fits to the users choices (from the decision tree) and thus will be highlighted
 * @param {String} name name of the object which will be used to create text object above the sphere
 * @param {Integer} id id of the object
 */
function generateSphere(position, picture, highlight, name, id)
{
    let value;
    if (highlight)
    {
        value = 2;
    }
    else
    {
        value = 1;
    }
    //creating sphere with texture, geometry and material
    let sphereTexture = new THREE.TextureLoader().load(picture);
    let sphereGeometry = new THREE.SphereGeometry(value);
    let sphereMaterial = new THREE.MeshBasicMaterial( {map: sphereTexture});
    let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.userData.id = id;
    sphere.name = name;
    //setting position of sphere
    sphere.position.set(position[0], value/2, position[1]);
    //mesh of sphere facing camera
    sphere.lookAt(cam.position);
    //adding sphere to the scene
    scene.add(sphere);
    console.log(sphere);
    //running generateText function with name, coordinates and value(to check if object is highlighted)
    generateText(name, position, highlight, id);
    }


//generate Text
/**
 * Creates a 3d text geometry and adds it to the scene
 * @param {String} name String containing the text which will be written
 * @param {Array} position Array containing the x- and z-coordinate of the text geometry (position is pointing to starting point of text so the beginning of the first letter in our case)
 * @param {Boolean} highlight indicates if the object fits to the users choices (from the decision tree) and thus will be highlighted
 * @param {Integer} id id of the object
 */
function generateText(name,position,highlight, id)
{
    //loader to load the right font
    let loader = new THREE.FontLoader();
    //variable for highlighting
    let value;
    //if object is highlighted the value is 2, else 1
    if (highlight)
    {
        value = 2
    }
    else
    {
        value = 1;
    }
    //loading the font and creating the text geometry
    loader.load('node_modules/three/examples/fonts/droid/droid_sans_bold.typeface.json', function (font){
        let textGeometry = new THREE.TextGeometry(name,
        {
            font: font,
            size: 0.5,
            height: 0.1
        });
        //creating mesh for text and adding materials (colors) to text
        let textMesh = new THREE.Mesh(textGeometry, [
            new THREE.MeshPhongMaterial({color: 0xFFFFFF}), 
            new THREE.MeshPhongMaterial({color: 0xAAAAAA})]);
        //creating a bounding box of the text to measure the size (for positioning later)
        let boundingBox = new THREE.Box3().setFromObject(textMesh);
        //correcting the position of text so it is placed in the middle of the object (x-wise) and not starting there
        let correctedPosition = position[0] - (textMesh.geometry.boundingBox.max.x - textMesh.geometry.boundingBox.min.x)/2;
        //setting position of textmesh with corrected position as x-value
        textMesh.position.set(correctedPosition,value*2,position[1]);
        textMesh.userData.id= id;
        //textMesh.lookAt(cam.position);
        scene.add(textMesh);
    })
}



function changeRadioButtons (parent)
{
    let i;
    let elementList = document.getElementsByName(parent);
    for (i = 0; i < elementList.length; i++)
    {
        if (elementList[i].checked == false)
        {
            let innerElementList = document.getElementsByName(elementList[i].id);
            untoggleRadioButtons(innerElementList);
        }
        else if(elementList[i].checked == true)
        {
            let innerElementList = document.getElementsByName(elementList[i].id);
            toggleRadioButtons(innerElementList);
        }
    }
}

function untoggleRadioButtons(elementList)
{
    let i;
    if (elementList.length > 0)
    {
        for (i = 0; i < elementList.length; i++)
        {
            document.getElementById(elementList[i].id).checked = false;
            document.getElementById(elementList[i].id).disabled = true;
            let innerElementList = document.getElementsByName(elementList[i].id);
            untoggleRadioButtons(innerElementList);
        }
    }
}

function toggleRadioButtons(elementList)
{
    let i;
    if (elementList.length > 0)
    {
        for (i = 0; i < elementList.length; i++)
        {
            document.getElementById(elementList[i].id).disabled = false;
        }
    }
}


/**
 * calculates cosine from degrees
 * @param {}degrees degrees of angle for which cosine shall be calculated
 *
 * @returns cosine of an agle with the input degrees
 */   
function getCosFromDegrees(degrees) 
{
    return Math.cos(degrees / 180 * Math.PI);    
}

/**
 * calculates sine from degrees
 * @param {}degrees degrees of angle for which sine shall be calculated
 *
 * @returns sine of an agle with the input degrees
 */   
function getSinFromDegrees(degrees) 
{
    return Math.sin(degrees / 180 * Math.PI);    
}
//render function
function drawScene() 
{
    renderer.render(scene, cam);
    let delta = clock.getDelta();
    processKeyboard(delta);
    requestAnimationFrame(drawScene);
}
drawScene();
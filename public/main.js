

//Global variables
let leafArray=[];


//Initialize ThreeJS
var scene = new THREE.Scene();
var cam = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({antialias: true});
scene.background = new THREE.Color(0x87CEEB);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
//setting up position for camera
cam.position.y = 0.5;
document.getElementById("scene").appendChild(renderer.domElement);

const groundTexture = new THREE.TextureLoader().load("img/ground.jpg");
const groundGeometry = new THREE.PlaneGeometry(100,100);
const groundMaterial = new THREE.MeshBasicMaterial({ map: groundTexture });
const ground = new THREE.Mesh(groundGeometry,groundMaterial);
ground.rotateX( - Math.PI / 2);
ground.position.set(0, -1,-25);
scene.add(ground);

//adding ambient light to the scene
var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
//Initialize ThreeJS

//setting up a grid for orientation
let gridHelper = new THREE.GridHelper(100,20, 0x0a0a0a, 0x0a0a0a);
gridHelper.position.set (0,-1,-25);
scene.add(gridHelper);

//setting up the camera controls
let controls = new THREE.PointerLockControls(cam, renderer.domElement);
let clock = new THREE.Clock(); 

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
        calculateClosestObject()
    }
    if (keyboard['s'])
    {
        controls.moveForward(-actualSpeed);
        calculateClosestObject()
    }
    if (keyboard['a'])
    {
        controls.moveRight(-actualSpeed);
        calculateClosestObject()
    }
    if (keyboard['d'])
    {
        controls.moveRight(actualSpeed);
        calculateClosestObject()
    }
}
//Camera Controls

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
    initializeContent("1_adaptive-maps-algorithm.json");
    //hide selection area of decision trees
    document.getElementById("selectDecisionTree").style.visibility ="hidden";
    //show button to lock controls
    document.getElementById("lockButton").style.display="block";
});

//event listener for example-button2 which will load the second example decision tree
let example2Button = document.querySelector("#example2Button");
example2Button.addEventListener('click',()=>
{
    initializeContent("2_common-thematic-map-types.json")
    //hide selection area of decision trees
    document.getElementById("selectDecisionTree").style.visibility ="hidden";
    //show button to lock controls
    document.getElementById("lockButton").style.display="block";

});


/**
 * Function to initialize loading of the chosen data from the JSON-file
 * @param {String} fileLink Hyperlink containing location of the chosen JSON-file
 */
function initializeContent(fileLink)
{
    loadJSON(fileLink, function(text)
    {
        let jsonData = JSON.parse(text);
        let jsonNodes = jsonData.graph.nodes;
        let jsonEdges = jsonData.graph.edges;
        let nodeArray = [];
        let i;
        for (i = 0; i<jsonNodes.length; i++)
        {
            if (jsonNodes[i].type == "node" || jsonNodes[i].type == "root")
            {
                nodeArray.push(jsonNodes[i]);
            }
        }
        for (i = 0; i<jsonNodes.length; i++)
        {
            if (jsonNodes[i].type == "leaf")
            {
                leafArray.push(jsonNodes[i]);
            }
        }
        createSelectionArea(nodeArray, jsonEdges);
        leavesToObjects(leafArray, jsonEdges);
    });
    document.getElementById("body").addEventListener("keyup", function(event) 
    {
        event.preventDefault();
        if (event.key === "e") 
        {
            document.getElementById("descriptionButton").click();
        }
    });
}



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



/**
 * Function to initialize all functions to create the selection area
 * @param {Array} nodeArray Array containing all nodes from the decision tree (without leaves and root)
 * @param {Array} edgesArray Array containing all edges from the decision tree
 */
function createSelectionArea(nodeArray, edgesArray)
{

    parametersToSections(nodeArray, edgesArray);
    nodesToRadioButtons(nodeArray, edgesArray);
    document.getElementById("selectionArea").style.display ="block";
}

/**
 * Converts the parameters (saved as nodes) of the decision tree into divs and headlines in the HTML document
 * @param {Array} nodeArray Array containing all nodes from the decision tree (without leaves and root)
 * @param {Array} edgesArray Array containing all edges from the decision tree
 */
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

/**
 * Converts the nodes of the decision tree into radio buttons in the HTML document
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
                    //add onclick-event to radiobuttons to receive current user selection and react to it
                    radiobutton.onclick = function() 
                    {
                        changeRadioButtons(this.name, leafArray, edgesArray);
                    }
                    radiobutton.classList.add("form-check-input");
                    //adding a label for the radiobutton
                    let label = document.createElement("label");
                    label.for = edgesArray[j].target;
                    label.id = "label"+edgesArray[j].target;
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

/**
 * Checks for all radiobuttons in the group and triggers either the toggle or untoggle function for it
 * @param {Integer} parent the name of the group (which is also the ID of the element it is appended to)
 */
 function changeRadioButtons (parent, leafArray, edgesArray)
 {
     //counter variable
     let i;
     //receive all elements with this name (all radiobuttons in the group)
     let elementList = document.getElementsByName(parent);
     let innerElementList;
     for (i = 0; i < elementList.length; i++)
     {
         //if the button is not checked, the untoggle-function is started with a list of the first group of radiobuttons depending on the one we just checked
         if (elementList[i].checked == false)
         {
             innerElementList = document.getElementsByName(elementList[i].id);
             untoggleRadioButtons(innerElementList);
         }
         //else the toggle-function is started with a list of the first group of radiobuttons depending on the one we just checked
         else if(elementList[i].checked == true)
         {
             innerElementList = document.getElementsByName(elementList[i].id);
             toggleRadioButtons(innerElementList);
         }
     }
     leavesToObjects(leafArray, edgesArray);
 }
 
 /**
  * Recursively disables and unchecks all radiobuttons in the current group and in all groups depending on that
  * @param {Array} elementList list of the radiobuttons in the current group
  */
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
 
 /**
  * Enables the radiobuttons in the current group
  * @param {Array} elementList list of the radiobuttons in the current group
  */
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

function checkForHighlight(leaf,edgesArray)
{
    let count1;
    let count2;
    let highlight = 0.7;
    let meaningfulArray = [];
    //extract all meaningful edges from edgesArray and push these into meaningfulArray
    for (count1 = 0; count1<edgesArray.length; count1++)
    {
        if (leaf.id == edgesArray[count1].target && edgesArray[count1].type == "meaningful")
        {
            meaningfulArray.push(edgesArray[count1].source);
        }

    }
    //if there is no meaningful edge, leaf is highlighted
    if (meaningfulArray.length <= 0)
    {   
        highlight = 2;
        return highlight;
    }
    
    for(count1 = 0; count1 < meaningfulArray.length; count1++)
    {
        let currentRBGroup = document.getElementsByName(document.getElementById(meaningfulArray[count1]).name);
        for (count2 = 0; count2 < currentRBGroup.length; count2 ++)
        {
                //if the Radiobutton is checked and it is not meaningful for the leaf, the leaf is not highlighted
                if (currentRBGroup[count2].checked && meaningfulArray.indexOf(currentRBGroup[count2].id) == -1) 
                {
                    highlight = 0.7;
                    return highlight;
                }
        }
    }
    //check all parameters if a radiobutton is selected which does not end up as meaningful for the leaf
    count1 = 1;
    //iterate through every parameter(div)
    while (document.getElementById(count1).tagName == "DIV")
    {
        //all child nodes of the div
        let childNodes = document.getElementById(count1).childNodes;
        for(count2 = 0; count2 < childNodes.length; count2 ++)
        {
            if (childNodes[count2].checked)
            {
                /*if(highlight == 2)
                {
                    return highlight;
                }*/
                for(let count3 = 0; count3 < meaningfulArray.length; count3 ++)
                {
                    if(childNodes[count2].id == meaningfulArray[count3])
                    {
                        highlight = 2;
                        return highlight;
                    }
                }
                highlight = disableHighlighting(childNodes, count2, meaningfulArray, 0.7);
            }
        }
        count1++;
    }
    return highlight;
}


 /**
  * Recursively checks for the current (checked) radio button if another dependant radio button exists which has a meaningful edge to the current leaf. If yes, highlight returns "true(2)"
  * @param {Array} childNodes array of the HTML-objects in the div. Indicates a checked radio button with currentCount
  * @param {Array} currentCount current indicator (counter for childNodes array)
  * @param {Array} meaningfulArray array of the meaningful edges for the current leaf
  * @param {Array} highlight the current highlight value
  */
function disableHighlighting(childNodes, currentCount, meaningfulArray, highlight)
{   
    //create an array of all dependant radio buttons of the checked radio button
    let radioGroup = document.getElementsByName(childNodes[currentCount].id);
    //if the radio button has any dependant radio buttons
    if (radioGroup.length > 0)
    {
        for(let count1 = 0; count1 < radioGroup.length; count1 ++)
        {
            //if meaningful edge to current radio button exists, highlight = true(2)
            if (meaningfulArray.indexOf(radioGroup[count1].id) >= 0)
            {
                highlight = 2;
                return highlight;
            }
            //only recursively use function if there are any more dependant radio buttons
            if(document.getElementsByName(radioGroup[count1].id.length > 0))
            {
            highlight = disableHighlighting(radioGroup, count1, meaningfulArray, highlight);
            }
        }
    }
    return highlight;
}

//create spheres from leaf-nodes
function leavesToObjects(leafArray, edgesArray)
{
        let i;
        let highlight;
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
                highlight = checkForHighlight(leafArray[i],edgesArray);
                let positionX = radius * getCosFromDegrees(startPoint + (i * positioncurrentId));
                let positionZ = radius * getSinFromDegrees(startPoint + (i * positioncurrentId));
                let name = leafArray[i].name;
                let id = leafArray[i].id;
                generateBox([positionX,positionZ],leafArray[i].imgpath, highlight, name, id);
                generateDescription(leafArray[i]);
            }
        

}

//generate Box
/**
 * Creates a box and adds it to the scene
 * @param {Array} position Array containing the x- and z-coordinate of the box 
 * @param {String} picture path of the image-data which will be used as texture for the box
 * @param {Integer} highlight indicates if the object fits to the users choices (from the decision tree) and thus will be highlighted
 * @param {String} name name of the object which will be used to create text object above the box
 * @param {Integer} id id of the object
 */
function generateBox(position, picture, highlight, name, id) 
{
    //delete old box and text if exists
    if(scene.getObjectByName(id) != null)
    {
    let object = scene.getObjectByName(id);
    object.geometry.dispose();
    object.material.dispose();
    scene.remove(object);
    let text = scene.getObjectByName("text"+id);
    scene.remove(text);
    }
    //creating box with texture, geometry and material
    let boxTexture = new THREE.TextureLoader().load(picture);
    let boxGeometry = new THREE.BoxGeometry(highlight*2, highlight*2, highlight*2);
    let boxMaterial = new THREE.MeshBasicMaterial({ map: boxTexture });
    let box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.name= id;
    box.userData.id = name;
    //setting position of the box
    box.position.set(position[0], highlight-1, position[1]);
    //facing the camera
    //box.lookAt(cam.position);
    //adding box to the scene
    scene.add(box);
    generateText(name, position, highlight, id);
}

//generate Text
/**
 * Creates a 3d text geometry and adds it to the scene
 * @param {String} name String containing the text which will be written
 * @param {Array} position Array containing the x- and z-coordinate of the text geometry (position is pointing to starting point of text so the beginning of the first letter in our case)
 * @param {Integer} highlight indicates if the object fits to the users choices (from the decision tree) and thus will be highlighted
 * @param {Integer} id id of the object
 */
function generateText(name,position,highlight, id)
{
    //loader to load the right font
    let loader = new THREE.FontLoader();
    //loading the font and creating the text geometry
    loader.load('node_modules/three/examples/fonts/droid/droid_sans_bold.typeface.json', function (font){
        let textGeometry = new THREE.TextGeometry(name,
        {
            font: font,
            size: highlight/2,
            height: 0.1
        });
        //creating mesh for text and adding materials (colors) to text
        let color;
        switch(highlight)
        {
            case 0.7:
                color = 0xf6f6f6;
                break;
            case 2:
                color = 0x000000;
        }
        let textMesh = new THREE.Mesh(textGeometry, [
            new THREE.MeshPhongMaterial({color: color}), 
            new THREE.MeshPhongMaterial({color: color})]);
        //creating a bounding box of the text to measure the size (for positioning later)
        let boundingBox = new THREE.Box3().setFromObject(textMesh);
        //correcting the position of text so it is placed in the middle of the object (x-wise) and not starting there
        let correctedPosition = position[0] - (textMesh.geometry.boundingBox.max.x - textMesh.geometry.boundingBox.min.x)/2;
        //setting position of textmesh with corrected position as x-value
        textMesh.position.set(correctedPosition,highlight*2,position[1]);
        textMesh.name = "text"+id;
        //textMesh.lookAt(cam.position);
        scene.add(textMesh);
    })
}


function generateDescription(leaf)
{
    let element = document.getElementById("descriptionDiv" + leaf.id);
    //only create if it does not already exist
    if(element == null)
    {
    console.log(leaf);
    let div = document.createElement("div");
    div.id = "descriptionDiv"+ leaf.id;
    let headline = document.createElement ("h2");
    headline.innerHTML = leaf.name;
    div.appendChild(headline);
    let text = document.createElement ("p");
    text.classList.add("lead");
    text.innerHTML = leaf.description;
    div.appendChild(text);
    div.style.display = "none";
    document.getElementById("descriptionArea").appendChild(div);
    }
}

//function to show description if the camera enters area around object
function calculateClosestObject()
{
    let distance;
    let shortestDistance = 0;
    scene.children.forEach(function (child) {
        if(child.name != "" && !child.name.startsWith("text"))
        {
            distance = cam.position.distanceTo(child.position);

            if (distance <10 && (distance < shortestDistance || shortestDistance == 0))
            {
            console.log(child);
            console.log(distance);
            document.getElementById("descriptionButtonArea").innerHTML = "";
            //event listener for example-button1 which will load the first example decision tree
            //let descriptionButton = document.querySelector("#descriptionButton");
            let descriptionButton = document.createElement("button");
            let id = child.name;
            //document.getElementById("descriptionButton").replaceWith(descriptionButton.cloneNode(false));
            descriptionButton.classList.add("btn","btn-primary");
            descriptionButton.id = "descriptionButton";
            descriptionButton.innerHTML = "Click E to toggle description of " + child.userData.id;
            //descriptionButton.removeEventListener('click', openDiv);
            descriptionButton.addEventListener('click', function openDiv()
            {
                let nodeList = document.getElementById("descriptionArea").childNodes;
                console.log(nodeList);
                for (let count=0;count < nodeList.length; count ++)
                {
                    if(nodeList[count].id != "descriptionDiv"+id)
                    {
                    nodeList[count].style.display = "none";
                    }
                }
                //if the description is not shown, show it
                if (document.getElementById("descriptionDiv"+id).style.display == "none")
                {
                document.getElementById("descriptionArea").style.display ="flex";    
                document.getElementById("descriptionDiv"+id).style.display ="block";
                descriptionButton.innerHTML = "Click E to toggle description of " + child.userData.id;
                }
                //if the description is shown, hide it
                else{
                document.getElementById("descriptionArea").style.display ="none";
                document.getElementById("descriptionDiv"+id).style.display ="none";
                descriptionButton.innerHTML = "Click E to toggle description of " + child.userData.id;
                }
            });
            descriptionButton.style.display ="block";
            document.getElementById("descriptionButtonArea").appendChild(descriptionButton);
            }
            if (distance < shortestDistance || shortestDistance == 0)
            {
            shortestDistance = distance;
            }
        }
    });
    if (shortestDistance > 10)
    {
        document.getElementById("descriptionButton").style.display="none";
    }
}

/**
 * helper function which calculates cosine from degrees
 * @param {}degrees degrees of angle for which cosine shall be calculated
 *
 * @returns cosine of an agle with the input degrees
 */   
function getCosFromDegrees(degrees) 
{
    return Math.cos(degrees / 180 * Math.PI);    
}

/**
 * helper function which calculates sine from degrees
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
    renderer.setSize(window.innerWidth, window.innerHeight);
    requestAnimationFrame(drawScene);
}
drawScene();
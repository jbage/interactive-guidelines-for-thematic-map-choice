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


//extract nodes into array
function createSelectionArea(jsonFile)
{
    loadJSON(jsonFile, function(text)
    {
        let jsonData = JSON.parse(text);
        let jsonNodes = jsonData.graph.nodes;
        let jsonEdges = jsonData.graph.edges;
        let i;
        //variable to shorten the code | used as the id of the current selected object in the NodeArray
        let currentId;
        let counterParagraph;
        console.log(jsonEdges);
        document.getElementById("selectionArea").style.display ="block";
        for (i = 0; i<jsonNodes.length; i++)
        {
            if (jsonNodes[i].type == "node" || jsonNodes[i].type == "parameter")
            {
                nodeArray.push(jsonNodes[i]);
            }
        }
        console.log(nodeArray);
        //For-Schleife, welche alle Parameter und Nodes durchläuft
        for(i = 0; i < nodeArray.length; i++)
        {
            //falls das Objekt ein Parameter ist
            if(nodeArray[i].type == "parameter")
            {
                currentId = nodeArray[i].id;
                let j; 
                let parameter = document.createElement("div");
                parameter.id = "div"+currentId;
                let headline = document.createElement("h3");
                headline.id = nodeArray[i].name;
                headline.innerHTML = nodeArray[i].name;
                parameter.appendChild(headline);
                document.getElementById("selectionForm").appendChild(parameter);
                for(j = 0; j < jsonEdges.length; j++)
                {
                    if(jsonEdges[j].source == currentId && jsonEdges[j].type == "parameter")
                    {
                        let radiobutton = document.createElement("input");
                        radiobutton.type = "radio";
                        radiobutton.id = jsonEdges[j].target;
                        radiobutton.name = jsonEdges[j].source;
                        radiobutton.value = jsonEdges[j].target;
                        radiobutton.classList.add("form-check-input");
                        let label = document.createElement("label");
                        label.for = jsonEdges[j].target;
                        label.classList.add("form-check-label");
                        let x = jsonEdges[j].target;
                        label.innerHTML = nodeArray[x-1].name;
                        document.getElementById("div"+currentId).appendChild(radiobutton);
                        document.getElementById("div"+currentId).appendChild(label);

                    }

                }
            }
            //falls das Objekt ein normales Node ist
            if(nodeArray[i].type == "node")
            {
                currentId = nodeArray[i].id;
                let j;
                for(j = 0; j < jsonEdges.length; j++)
                {
                    if(jsonEdges[j].source == currentId && jsonEdges[j].type == "superclass")
                    {
                        let radiobutton = document.createElement("input");
                        radiobutton.type = "radio";
                        radiobutton.id = jsonEdges[j].target;
                        radiobutton.name = jsonEdges[j].source;
                        radiobutton.value = jsonEdges[j].target;
                        radiobutton.onclick = function() 
                        {
                            toggleRadioButtons(this.name);
                        }
                        radiobutton.classList.add("form-check-input");
                        let label = document.createElement("label");
                        label.for = jsonEdges[j].target;
                        label.classList.add("form-check-label");
                        let x = jsonEdges[j].target;
                        label.innerHTML = nodeArray[x-1].name;
                        document.getElementById(currentId).parentNode.appendChild(radiobutton);
                        document.getElementById(currentId).parentNode.appendChild(label);
                        counterParagraph = currentId;
                    }

                }
                //Paragraph after a group of Radiobuttons
                console.log(document.getElementById(currentId).parentNode.lastChild.tagName);
                if(document.getElementById(currentId).parentNode.lastChild.tagName != "BR")
                {
                    document.getElementById(currentId).parentNode.appendChild(document.createElement("br"));
                }
            }
        }
        let submitButton = document.createElement("button");
        submitButton.classList.add("btn-primary");
        submitButton.innerHTML = "Highlight suitable Map Choices";
        document.getElementById("selectionForm").appendChild(submitButton);
    });
}
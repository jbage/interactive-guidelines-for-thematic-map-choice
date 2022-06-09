
const port=3000;
const express = require("express")
const app = express()

//Send index.html on request to "/"
app.get('/', (req,res) => {
    res.sendFile(__dirname + '/index.html')
})

//Make all Files stored in Folder "public" accessible over localhost:3000/public
app.use(express.static(__dirname + "/public"))

// listen on port 3000
app.listen(port,
    () => console.log(`Example app listening at http://localhost:${port}`)
)

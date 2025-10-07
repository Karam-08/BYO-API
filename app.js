import express from 'express'
import path from 'path'
import morgan from 'morgan'
import {fileURLToPath} from 'url'
// import {ensureDataFile, listRecipes, addRecipe} from './utils/recipes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 5000

// Middleware
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

// Static Folder
app.use(express.static(path.join(__dirname, "public")))
// ensureDataFile() // Makes sure the data file(recipes.json) exists when the project boots

async function readDB(){
    const rawData = await fs.readFile(database, 'utf-8')
    return JSON.parse(rawData)
}

async function writeDB(data){
    const text = JSON.stringify(data, null, 2)
    await fs.writeFile(database, text, 'utf-8')
}

app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.post('', (req, res) =>{
    
})

app.get('', (req, res) =>{

})

app.get('', (req, res) =>{

})

app.patch('', (req, res) =>{

})

app.delete('', (req, res) =>{

})

app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`)
})
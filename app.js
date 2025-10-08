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

app.get('/api/recipes', async (req, res, next) =>{
    try{
        const recipes = await listRecipes()
        res.status(200).json({count: recipes.length, recipes})
    }catch(err){
        next(err)
    }
})

app.post('/api/recipes', async (req, res, next) =>{
    try{
        const data = req.body
        const created = await addRecipe(data)
        res.status(201).json({message: "Recipe Added:", recipe:created})
    }catch(err){
        next(err)
    }
})

async function readDB(){
    const rawData = await fs.readFile(database, 'utf-8')
    return JSON.parse(rawData)
}

async function writeDB(data){
    const text = JSON.stringify(data, null, 2)
    await fs.writeFile(database, text, 'utf-8')
}

app.use((req, res, next) =>{
    // Log the core request parts
    console.log("\n--- Incoming Request ---")
    console.log("Method:", req.method)
    console.log("URL:", req.url)
    console.log("Headers:", req.headers)
    console.log("Body:", req.body)

    // After the response is sent, we log the status code
    res.on("finish", ()=>{
        console.log("--- Outgoing Response ---")
        console.log("Status:", res.status)
        console.log("-------------------------------\n")
    })

    next()
})

app.get('/', (req, res) =>{
    res.status(200).json({
        message: "Recipe API is running",
        endpoints: ['/recipes (GET, POST)', '/recipes/:id (GET, PUT, DELETE)']
    })
})

app.get('/recipes', async (req, res) =>{
    try{
        const recipes = await readDB()
        res.status(200).json(recipes)
    }catch(err){
        console.error(err)
        res.status(500).json({error: "Server failed to read all recipes."})
    }
})

app.get('/recipes/:id', async (req, res) =>{
    try{
        const recipes = await readDB()
        const recipe = recipes.find(r => r.id == req.params.id)
        if(!recipe){
            return res.status(404).json({error: "recipe not found"})
        }
        res.status(200).json(recipe)
    }catch(err){
        console.error(err)
        res.status(500).json({error: "Server failed to read recipes"})
    }
})

app.post('/recipes', async (req, res) =>{
    try{

    }catch(err){
        console.error(err)
        res.status(500).json({error: "Server could not add the recipe."})
    }
})

app.patch('', async (req, res) =>{
    try{

    }catch(err){
        console.error(err)
        res.status(500).json({error: "Server failed to update the recipe.+"})
    }
})

app.delete('/recipes/:id', async (req, res) =>{
    try{
        const recipes = await readDB()
        const idx = recipes.findIndex(r, r.id == req.params.id)

        if(idx === -1){
            return res.status(404).json({error: "Recipe not found."})
        }

        const deletedRecipe = recipes.splice(idx, 1)[0]
        await writeDB(recipes)
        
        res.status(200).json(deletedRecipe)

    }catch(err){
        console.error(err)
        res.status(500).json({error: "Server failed to delete recipe."})
    }
})

app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`)
})
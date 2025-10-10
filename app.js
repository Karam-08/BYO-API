import express from 'express'
import path from 'path'
import morgan from 'morgan'
import cors from 'cors'
import dotenv from 'dotenv'
import {fileURLToPath} from 'url'
import {ensureDataFile, listRecipes, addRecipe} from './utils/recipes.js'
import {ensureTagsFile, listTags, addTag, deleteTag} from './utils/tags.js'
import fs from 'fs/promises'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000
const database = path.join(__dirname, 'data', 'recipes.json')

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

await ensureDataFile()
await ensureTagsFile()

app.use(express.static(path.join(__dirname, "public")))


app.get('/', (req, res) =>{
    res.status(200).json({
        message: "Welcome to the Recipe API!",
        usage: "Use the end points to manage recipes.",
        endpoints: {
            "GET /api/recipes": "List all recipes",
            "POST /api/recipes": "Create a new recipe",
            "GET /api/recipes/:id": "Get one recipe by ID",
            "PATCH /api/recipes/:id": "Update part of a recipe",
            "DELETE /api/recipes/:id": "Delete a recipe",
            "GET /api/tags": "List all tags from recipes"
        }
    })
})

async function readDB(){
    const rawData = await fs.readFile(database, 'utf-8')
    return JSON.parse(rawData)
}

async function writeDB(data){
    const text = JSON.stringify(data, null, 2)
    await fs.writeFile(database, text, 'utf-8')
}

// Gets all the recipes
app.get('/api/recipes', async (req, res, next) =>{
    try{
        const recipes = await listRecipes()
        res.status(200).json({count: recipes.length, recipes})
    }catch(err){
        next(err)
    }
})

// Adds a new recipe
app.post('/api/recipes', async (req, res, next) =>{
    try{
        const data = req.body
        const created = await addRecipe(data)
        res.status(201).json({message: "Recipe Added:", recipe: created})
    }catch(err){
        next(err)
    }
})

// Gets a recipe by ID
app.get('/api/recipes/:id', async (req, res) =>{
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

// Change a recipe
app.patch('/api/recipes/:id', async (req, res, next) =>{
    try{
        const recipes = await readDB()
        const idx = recipes.findIndex(r => r.id == req.params.id)

        if(idx === 1){
            return res.status(404).json({error: "Recipe not found."})
        }

        recipes[idx] = {
            ...recipes[idx], 
            ...req.body, 
            updatedAt: new Date().toISOString()
        }

        await writeDB(recipes)
        res.status(200).json({message: "Recipe updated", recipe: recipes[idx]})

    }catch(err){
        next(err)
    }
})

// Delete recipe
app.delete('/api/recipes/:id', async (req, res, next) =>{
    try{
        const recipes = await readDB()
        const idx = recipes.findIndex(r => r.id === req.params.id)

        if(idx === -1){
            return res.status(404).json({error: "Recipe not found."})
        }

        const deletedRecipe = recipes.splice(idx, 1)[0]
        await writeDB(recipes)
        
        res.status(200).json({message: 'Recipe deleted', deletedRecipe})

    }catch(err){
        next(err)
    }
})

// Gets tags
app.get('/api/tags', async (req, res, next) =>{
    try{
        const tags = await listTags()
        res.status(200).json({count: tags.length, tags})
    }catch(err){
        next(err)
    }
})

// Adds tags
app.post('/api/tags', async (req, res) =>{
    try{
        const created = await addTag(req.body.name)
        res.status(201).json({ message: 'Tag added', tag: created })
    }catch(err){
        res.status(400).json({ error: err.message })
    }
})

app.delete('/api/tags/:id', async (req, res) =>{
      try{
        const deleted = await deleteTag(req.params.id)
        res.status(200).json({message: 'Tag deleted', deleted})
    }catch(err){
        res.status(404).json({error: err.message})
    }
})

// 404 for undefined routes
app.use((req, res) =>{
    res.status(404).json({error: {message: 'Route not found.'}})
})

app.use((err, req, res, next) =>{
    console.error("Error", err.message)
    res.status(500).json({
        error:{
            message: err.message || 'Internal Server Error',
            details: err.details || null,
        },
    })
})

app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`)
})
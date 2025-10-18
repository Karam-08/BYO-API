import express from 'express'
import path from 'path'
import morgan from 'morgan'
import cors from 'cors'
import dotenv from 'dotenv'
import {fileURLToPath} from 'url'
import {ensureRecipesFile, listRecipes, addRecipe} from './utils/recipes.js'
import {ensureTagsFile, listTags} from './utils/tags.js'
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

await ensureRecipesFile() // Ensures that the recipe file exists
await ensureTagsFile() // Ensures that the tags file exists

app.use(express.static(path.join(__dirname, "public")))

async function readDB(){
    const rawData = await fs.readFile(database, 'utf-8')
    return JSON.parse(rawData)
}

async function writeDB(data){
    const text = JSON.stringify(data, null, 2)
    await fs.writeFile(database, text, 'utf-8')
}

// Gets all of the recipes
app.get('/recipes', async (req, res, next) =>{
    try{
        const recipes = await listRecipes()
        res.status(200).json({count: recipes.length, recipes})
    }catch(err){
        next(err)
    }
})

// Gets all of the recipes' ingredients
app.get('/recipes/ingredients', async (req, res) =>{
    try{
        const recipes = await readDB()
        const allIngredients = recipes.map(r =>({ // Creates a new array with
            dishName: r.dishName, // The dish name
            ingredients: r.ingredients // And the ingredients
        }))
        res.status(200).json({count: allIngredients.length, allIngredients}) // Which is shown as a response
    }catch(err){
        console.error(err)
        res.status(500).json({error: "The server failed to read the recipes' ingredients"})
    }
})

// Gets all of the recipes' ratings
app.get('/recipes/ratings', async (req, res) =>{
    try{
        const recipes = await readDB()
        const allRatings = recipes.map(r =>({
            dishName: r.dishName,
            rating: r.rating
        }))
        res.status(200).json({count: allRatings.length, allRatings})
    }catch(err){
        console.error(err)
        res.status(500).json({error: "The server failed to read the recipes' ratings"})
    }
})

// Adds a new recipe (requires POSTMAN or a similar tool)
app.post('/recipes', async (req, res, next) =>{
    try{
        const data = req.body
        const created = await addRecipe(data)
        res.status(201).json({message: "Recipe Added:", recipe: created})
    }catch(err){
        next(err)
    }
})

// Gets a recipe by ID
app.get('/recipes/:id', async (req, res) =>{
    try{
        const recipes = await readDB()
        const recipe = recipes.find(r => r.id == req.params.id)
        if(!recipe){
            return res.status(404).json({error: "Recipe not found."})
        }
        res.status(200).json(recipe)
    }catch(err){
        console.error(err)
        res.status(500).json({error: "The server failed to read the recipe"})
    }
})

// Gets a specific recipe's ingredients
app.get('/recipes/:id/ingredients', async (req, res) =>{
    try{
        const recipes = await readDB()
        const recipe = recipes.find(r => r.id == req.params.id)
        if(!recipe){
            return res.status(404).json({error: "Recipe not found."})
        }
        res.status(200).json({dishName: recipe.dishName, ingredients: recipe.ingredients})
    }catch(err){
        console.error(err)
        res.status(500).json({error: "The server failed to read the recipe's ingredients"})
    }
})

// Gets a specific recipe's rating
app.get('/recipes/:id/rating', async (req, res) =>{
    try{
        const recipes = await readDB()
        const recipe = recipes.find(r => r.id == req.params.id)
        if(!recipe){
            return res.status(404).json({error: "Recipe not found."})
        }
        res.status(200).json({dishName: recipe.dishName, rating: recipe.rating})
    }catch(err){
        console.error(err)
        res.status(500).json({error: "Server failed to read the recipe's rating"})
    }
})

// Changes a recipe (requires POSTMAN or a similar tool)
app.patch('/recipes/:id', async (req, res, next) =>{
    try{
        const recipes = await readDB()
        const idx = recipes.findIndex(r => r.id == req.params.id)

        if(idx === -1){
            return res.status(404).json({error: "Recipe not found."})
        }

        recipes[idx] = {
            ...recipes[idx], 
            ...req.body, 
        }

        await writeDB(recipes)
        res.status(200).json({message: "Recipe updated", recipe: recipes[idx]})

    }catch(err){
        next(err)
    }
})

// Deletes a recipe (requires POSTMAN or a similar tool)
app.delete('/recipes/:id', async (req, res, next) =>{
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
app.get('/tags', async (req, res, next) =>{
    try{
        const tags = await listTags()
        res.status(200).json({count: tags.length, tags})
    }catch(err){
        next(err)
    }
})

// 404 for undefined routes
app.use((req, res) =>{
    res.status(404).json({error: {message: 'Route not found.'}})
})

// General error handler
app.use((err, req, res) =>{
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
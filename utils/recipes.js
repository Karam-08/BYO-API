import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const folder = path.join(__dirname, '..', 'data')
const file = path.join(folder, "recipes.json")

// Verify or create file before booting program
export async function ensureDataFile(){
    try{
        await fs.mkdir(folder, {recursive:true})
        await fs.access(file)
    }catch{
        await fs.writeFile(file, "[]", "utf8")
    }
}

// Read all stuednts from json
export async function listRecipes(){
    const rawData = await fs.readFile(file, "utf8")
    try{
        return JSON.parse(rawData)
    }catch{
        console.error(err)
        // In case the file is gone or corrupted
        await fs.writeFile(file, "[]", "utf8")
        return []
    }
}

// Validate data
function dataValidation(input){
    const errors = []

    const dishName = String(input.dishName || "").trim()
    const ingredients = String(input.ingredients || "").trim()
    const tags = String(input.tags || "").trim()
    const rating = String(input.rating || "").trim()

    if(!dishName){errors.push("The name of the dish is required.")}
    if(!ingredients){errors.push("The ingredients are required.")}
    if(!tags){errors.push("Tags are required.")}
    if(!Number.isFinite(rating) || rating < 1 || rating > 10){
        errors.push("The rating must be a number between 1 and 10.")
    }

    return{
        dishName,
        ingredients: ingredients.toLowerCase,
        tags: tags.toLowerCase(),
        rating
    }
}

// Gen ID
function genID(){
    return(Date.now().toString(36) + Math.random().toString(36).slice(2, 8).toUpperCase())
}

// Adds Recipe
export async function addRecipe(input){
    const cleanData = dataValidation(input)

    const newRecipe = {
        id: Date.now().toString(36),
        ...cleanData,
        addedOn: new Date().toISOString()
    }

    const recipes = await listRecipes()
    recipes.push(newRecipe)
    await fs.writeFile(file, JSON.stringify(recipes, null, 2), "utf8")
    return newRecipe
}
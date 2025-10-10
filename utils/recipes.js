import fs from 'fs/promises'
import path from 'path'
import {fileURLToPath} from 'url'
import {listTags as listValidTags} from './tags.js'

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

// Reads all recipes from json
export async function listRecipes(){
    try{
        const rawData = await fs.readFile(file, "utf8")
        return JSON.parse(rawData)
    }catch(err){
        console.error(err)
        // In case the file is gone or corrupted
        await fs.writeFile(file, "[]", "utf8")
        return []
    }
}

// Validate data
async function dataValidation(input){
    const errors = []

    const dishName = String(input.dishName || "").trim()
    const ingredients = String(input.ingredients || "").trim()
    const tags = String(input.tags || "").trim()
    const rating = Number(input.rating)

    if(!dishName){errors.push("The name of the dish is required.")}
    if(!ingredients){errors.push("The ingredients are required.")}
    if(!tags){errors.push("Tags are required.")}
    if(!Number.isFinite(rating) || rating < 1 || rating > 10){
        errors.push("The rating must be a number between 1 and 10.")
    }

    // Splits the tag string into an array
    const tagsArray = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)

    // Validates the tags against tags.json
    const existingTags = (await listValidTags()).map(t => t.name)
    const invalidTags = tagsArray.filter(t => !existingTags.includes(t))
    if(invalidTags.length > 0){
        errors.push(`These tags do not exist: ${invalidTags.join(', ')}`)
    }

    if(errors.length > 0){
        const err = new Error('Invalid recipe data')
        err.details = errors
        throw err
    }

    return{
        dishName,
        ingredients: ingredients.toLowerCase(),
        tags: tagsArray,
        rating
    }
}

// Gen ID
function genID(){
    return(Date.now().toString(36) + Math.random().toString(36).slice(2, 8).toUpperCase())
}

// Adds Recipe
export async function addRecipe(input){
    const cleanData = await dataValidation(input)

    const availableTags = await listTags()
    const tagNames = availableTags.map(t => t.name)
    const invalidTags = cleanData.tags.filter(t => !tagNames.includes(t))

    if(invalidTags.length > 0){
        throw new Error(`Invalid tags: ${invalidTags.join(', ')}`)
    }

    const newRecipe = {
        id: genID(),
        ...cleanData,
        addedOn: new Date().toISOString()
    }

    const recipes = await listRecipes()
    recipes.push(newRecipe)
    await fs.writeFile(file, JSON.stringify(recipes, null, 2), "utf8")
    return newRecipe
}
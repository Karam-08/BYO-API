import fs from 'fs/promises'
import path from 'path'
import {fileURLToPath} from 'url'
import {listTags as listValidTags} from './tags.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const folder = path.join(__dirname, '..', 'data')
const file = path.join(folder, "recipes.json")

// Verify or create file before booting program
export async function ensureRecipesFile(){
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
async function recipeValidation(input){
    const errors = []

    const dishName = String(input.dishName || "").trim()
    const ingredients = String(input.ingredients || "").trim()
    const tags = String(input.tags || "").trim()
    const rating = Number(input.rating)

    if(!dishName){errors.push("The name of the dish is required.")}
    if(!ingredients){errors.push("The ingredients are required.")}
    if(tags.length === 0){errors.push("At least 1 tag is required.")}
    if(!Number.isFinite(rating) || rating < 1 || rating > 10){
        errors.push("The rating must be a number between 1 and 10.")
    }

    // Splits the tag string into an array
    const tagsArray = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)

    // Validates the tags against tags.json
    const existingTags = (await listValidTags()).map(t => t.name)
    const invalidTags = tagsArray.filter(t => !existingTags.includes(t))

    if(invalidTags.length > 0){
        throw new Error(`Invalid tags: ${invalidTags.join(", ")}`);
    }

    if(errors.length > 0){
        const err = new Error('Invalid recipe data')
        err.details = errors
        throw err
    }

    return{
        dishName,
        ingredients: ingredients
            .toLowerCase()
            .split(',')
            .map(i => i.trim())
            .join(', '), // normalizes the spaces after commas to match the rest of the recipes
        tags: tagsArray,
        rating
    }
}

// Gen ID
async function genID(){
    const recipes = await listRecipes()
    const maxNum = recipes
        .map(r =>{
            const id = r.id || "" // Fallback in case id is missing
            if(typeof id === "string" && id.startsWith("r")){  // If the ID is a string and starts with "r"
                return Number(id.replace("r", "")) // remove the "r" and convert it to a number
            }
            return 0 // Otherwise return 0
        })
        .reduce((a, b) => Math.max(a, b), 0) // Finds the maximum number or returns 0 as a fallback
    return `r${maxNum + 1}` // returns r followed by the next number
}

// Adds Recipe
export async function addRecipe(input){
    const cleanData = await recipeValidation(input)

    const availableTags = await listValidTags()
    const tagNames = availableTags.map(t => t.name)
    const invalidTags = cleanData.tags.filter(t => !tagNames.includes(t))

    if(invalidTags.length > 0){
        throw new Error(`Invalid tags: ${invalidTags.join(', ')}`)
    }

    const newRecipe = {
        id: await genID(),
        ...cleanData,
    }

    const recipes = await listRecipes()
    recipes.push(newRecipe)
    await fs.writeFile(file, JSON.stringify(recipes, null, 2), "utf8")
    return newRecipe
}
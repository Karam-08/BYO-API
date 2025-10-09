import fs from 'fs/promises'
import path from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const folder = path.join(__dirname, '..', 'data')
const file = path.join(folder, "recipes.json")

// Verify or create file before booting program
export async function ensureTagsFile(){
    try{
        await fs.mkdir(folder, {recursive:true})
        await fs.access(file)
    }catch{
        await fs.writeFile(file, "[]", "utf8")
    }
}

export async function listTags(){
    try{
        const data = await fs.readFile(file, 'utf8')
        return JSON.parse(data)
    }catch(err){
        console.error("Failed to read tags:", err)
        await fs.writeFile(file, "[]", "utf8")
        return []
    }
}

export async function addTag(name){
    if(!name || typeof name !== 'string'){
        throw new Error('Tag name is required and it must be in a string.')
    }

    const cleanName = name.trim.toLowerCase
    const tags = await listTags()

    if(tags.some(t => t.name === cleanName)) {
        throw{error: {message: "Tag already exists."}}
    }

    const newTag = {
        id: Date.now().toString(36), 
        name: cleanName
    }

    tags.push(newTag)
    await fs.writeFile(file, JSON.stringify(tags, null, 2), 'utf8')
    
    return newTag
}

export async function deleteTag(id) {
    const tags = await listTags()
    const idx = tags.findIndex(t => t.id === id)
    if (idx === -1) throw new Error('Tag not found.')

    const deleted = tags.splice(idx, 1)[0]
    await fs.writeFile(file, JSON.stringify(tags, null, 2), 'utf8')
    return deleted
}
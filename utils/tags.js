import fs from 'fs/promises'
import path from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const folder = path.join(__dirname, '..', 'data')
const file = path.join(folder, "tags.json")

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
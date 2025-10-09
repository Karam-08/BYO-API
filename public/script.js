const form = document.getElementById('recipe-form')
const listButton = document.getElementById('listButton')
const listPre = document.getElementById('js-list')

form.addEventListener('submit', async (e) =>{
    e.preventDefault() // prevents the page from reload

    // Gets form values
    const dishName = form.dishName.value.trim()
    const ingredients = form.ingredients.value.trim()
    const tags = form.tags.value.trim().split(',').map(t => t.trim().toLowerCase())
    const rating = Number(form.rating.value)

    // Builds the object
    const recipeData = {dishName, ingredients, tags, rating}

    try{
        const res = await fetch('/api/recipes', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(recipeData)
        })
        const data = await res.json()

        if(!res.ok){
            throw data
        }

        alert('Recipe added successfully!')
        form.reset()

    }catch(err){
        alert('Error: ' + (err.error?.message || err.message))
    }
})

listButton.addEventListener('click', async () =>{
    try{
        const res = await fetch('/api/recipes')
        const data = await res.json()
        listPre.textContent = JSON.stringify(data, null, 2)
    }catch(err){
        listPre.textContent = 'Error loading recipes'
    }
})
# My Recipe API

Welcome to **My Recipe API** — an API that allows you to manage recipes.

---

## Overview

- **Total Recipes:** 25  
- **Total Tags:** 10  
- **Recipe IDs:** `r1, r2, r3 ... r25`

---

## Primary Resource: `/recipes`

| Method | Endpoint | Description |
|:-------|:----------|:-------------|
| **POST** | `/recipes` | Creates a new recipe |
| **GET** | `/recipes` | Lists every recipe |
| **GET** | `/recipes/:id` | Gets a single recipe |
| **PATCH** | `/recipes/:id` | Updates a recipe |
| **DELETE** | `/recipes/:id` | Deletes a recipe |

---

## Secondary Resource: `/tags`

| Method | Endpoint | Description |
|:-------|:----------|:-------------|
| **GET** | `/tags` | Lists all tags |

---

## API Endpoints

### View every recipe
```
GET localhost:5000/recipes
```

### View a single recipe
```
GET localhost:5000/recipes/:id
```
Replace `:id` with the actual recipe ID (e.g., `r1`, `r2`, etc.)

### View a recipe's ingredients
```
GET localhost:5000/recipes/:id/ingredients
```
Replace `:id` with the actual recipe ID.

### View a recipe's rating
```
GET localhost:5000/recipes/:id/rating
```
Replace `:id` with the actual recipe ID.

### View every tag
```
GET localhost:5000/tags
```

---

## Example POST Request

```http
POST /recipes
Content-Type: application/json

{
    "dishName": "Chocolate Cake",
    "ingredients": "flour, sugar, cocoa powder, eggs, butter, milk",
    "tags": ["dessert"]
    "rating": 9
}
```

---

## Example Response

```json
{
    "id": "r1",
    "dishName": "Chocolate Cake",
    "ingredients": "flour, sugar, cocoa powder, eggs, butter, milk",
    "tags": ["dessert"],
    "rating": 9
}
```

---

## Testing

Use tools like **Postman** or **cURL** to interact with the API endpoints.

---

This API provides an easy way to view, add, update, and delete recipes and tags.

## Authors

- [Karam Abbas](https://www.github.com/Karam-08)


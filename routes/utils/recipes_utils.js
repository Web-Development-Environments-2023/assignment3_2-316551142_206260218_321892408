const axios = require("axios");
const { response } = require("express");
const { type } = require("express/lib/response");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}


function mapRecipeDetials(recipes_info){
    return recipes_info.map((recipe)=>{
        let data=recipe;
        if(recipe.data)
            data=recipe.data;
        return {
            id:data.id,
            title:data.title,
            image:data.image,
            readyInMinutes:data.readyInMinutes,
            popularity:data.aggregateLikes,
            vegan:data.vegan,
            vegetarian:data.vegetarian,
            glutenFree:data.glutenFree
        }
    })
}



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}

async function getRecipesPreview(recipes){
    let prom=[];
    recipes.map((id)=>{
        prom.push(getRecipeInformation(id));
    });
    let response=await Promise.all(prom);
    return mapRecipeDetials(response);
}


async function getRecipesRandom(){
    const response=await axios.get(`${api_domain}/random`,{
        params:{
            number:10,
            apiKey:process.env.spooncular_apiKey
        }
    });
    let filtered=response.data.recipes.filter((recipe)=>(recipe.instructions!="")&&(recipe.image));
    if (filtered.lenght<3)
        return getRecipesRandom();
    return mapRecipeDetials([filtered[0],filtered[1],filtered[2]]);
}



async function searchRecipes(name,number,cuisine,diet,intolerance){
    let params={
        apiKey: process.env.spooncular_apiKey
    }
    let path=""
    if (name)
        path=`&query=${name}`;
    if(cuisine)
        path+=`&cuisine=${cuisine}`;
        if (name)
        path=`&query=${name}`;
    if(diet)
        path+=`&diet=${diet}`;
    if(intolerance)
        path+=`&intolerances=${intolerance}`;
    const response= await axios.get(`${api_domain}/complexSearch?number=${number}&apiKey=${process.env.spooncular_apiKey}${path}`);
    let filtered=response.data.results.filter((recipe)=>(recipe.instructions!="")&&(recipe.image));
    // if (filtered.lenght<number)
    //     return searchRecipes(path,number);
    let arr=[];
    filtered.forEach(element => {
        arr.push(element.id);
    });
    return getRecipesPreview(arr);
}


async function getRecipeShow(recipe_id){
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, extendedIngredients, instructions, servings,analyzedInstructions,title,
        readyInMinutes,image,aggregateLikes,vegan,vegetarian, glutenFree} = recipe_info.data;
    let ingredients=[];
    for (i in extendedIngredients){
        ingredients.push({
            name: extendedIngredients[i]["name"],
            amount: extendedIngredients[i]["measures"]
        });
    }
    return {
        id: id,
        extendedIngredients: extendedIngredients,
        instructions: instructions,
        servings: servings,
        analyzedInstructions:analyzedInstructions,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        aggregateLikes: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree
    }
}

exports.getRecipeDetails = getRecipeDetails;
exports.getRecipesRandom = getRecipesRandom;
exports.getRecipesPreview = getRecipesPreview;
exports.searchRecipes = searchRecipes;
exports.getRecipeShow = getRecipeShow;



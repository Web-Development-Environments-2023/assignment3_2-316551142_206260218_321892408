const DButils = require("./DButils");

async function markAsFavorite(userName, recipe_id){
    const user=await DButils.execQuery(`select userName from users where userName='${userName}'`);
    if (user.length ==0)
        return false;
    await DButils.execQuery(`insert into favorite_recipes values ('${userName}',${recipe_id})`);
    return true;
}

async function removeFavorite(userName, recipe_id){
    const user=await DButils.execQuery(`select userName from users where userName='${userName}'`);
    if (user.length ==0)
        return false;
    await DButils.execQuery(`delete from favorite_recipes where userName='${userName}' AND recipe_id=${recipe_id}`);
    return true;
}

async function getFavoriteRecipes(userName){
    const user=await DButils.execQuery(`select userName from users where userName='${userName}'`);
    if (user.length ==0)
        return false;
    const recipes_id = await DButils.execQuery(`select recipe_id from favorite_recipes where userName='${userName}'`);
    return recipes_id;
}


async function markAsView(userName, recipe_id){
    const user=await DButils.execQuery(`select userName from users where userName='${userName}'`);
    if (user.length ==0)
        return false;
    const ids=await DButils.execQuery(`select recipe_id from views_recipes where userName='${userName}'`);
    let count=0;
    for (i of ids){
        let id=i.recipe_id
        if (id==recipe_id)
            count++;
    }
    if(count>0)
        await DButils.execQuery(`update views_recipes set created=now() where userName='${userName}' AND recipe_id=${recipe_id}`);
    else await DButils.execQuery(`insert into views_recipes values ('${userName}',${recipe_id},now())`);
    return true;
}

async function getViewRecipes(userName){
    const user=await DButils.execQuery(`select userName from users where userName='${userName}'`);
    if (user.length ==0)
        return false;
    const recipes_id = await DButils.execQuery(`select recipe_id from views_recipes where userName='${userName}' order by created ASC`);
    return recipes_id.slice(-3);
}

async function markAsFamily(userName, recipe_id){
    const user=await DButils.execQuery(`select userName from users where userName='${userName}'`);
    if (user.length ==0)
        return false;
    await DButils.execQuery(`insert into family_recipes values ('${userName}',${recipe_id})`);
    return true;
}

async function getFamilyRecipes(userName){
    const user=await DButils.execQuery(`select userName from users where userName='${userName}'`);
    if (user.length ==0)
        return false;
    const recipes_id = await DButils.execQuery(`select recipe_id from family_recipes where userName='${userName}'`);
    return recipes_id;
}

async function getFamilyRecipesIds(ids){
    let results=[]
    for (id of ids){
        let r=await getFamilyRecipeFromId(id);
        results.push(r);
    }
    return results;
}

async function getFamilyRecipeFromId(id){
    const recipe = await DButils.execQuery(`select * from recipes where recipe_id=${id}`);
    return recipe;
}

async function getMyRecipes(userName){
    const user=await DButils.execQuery(`select userName from users where userName='${userName}'`);
    if (user.length ==0)
        return false;
    const recipes_id = await DButils.execQuery(`select recipe_id from my_recipes where userName='${userName}'`);
    return recipes_id;
}

async function getMyRecipesIds(ids){
    let results=[]
    for (id of ids){
        let r=await getMyRecipeFromId(id);
        results.push(r);
    }
    return results;
}

async function getMyRecipeFromId(id){
    const recipe = await DButils.execQuery(`select * from recipes where recipe_id=${id}`);
    return recipe;
}


async function getViewsId(ids,userName){
    let results={}
    for (id of ids){
        let r=await getViewFromId(id,userName);
        if(r[0].rid==1)
            results[id]=true;
        else
            results[id]=false;
    }
    return results;
}

async function getViewFromId(id,name){
    const recipe = await DButils.execQuery(`select count(*) as rid from favorite_recipes where recipe_id=${id} AND userName='${name}'`);
    return recipe;
}

async function getFavoritesId(ids,userName){
    let results={}
    for (id of ids){
        let r=await getFavoriteFromId(id,userName);
        if(r[0].rid)
            results[id]=true;
        else
            results[id]=false;
    }
    return results;
}

async function getFavoriteFromId(id,name){
    const recipe = await DButils.execQuery(`select count(*) as rid from favorite_recipes where recipe_id=${id} AND userName='${name}'`);
    return recipe;
}

async function createRecipe(name,id){
    const user=await DButils.execQuery(`select userName from users where userName='${name}'`);
    if (user.length ==0)
        return false;
    await DButils.execQuery(`insert into my_recipes values ('${name}',${id})`);
    return true;
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.markAsView = markAsView;
exports.getViewRecipes = getViewRecipes;
exports.markAsFamily = markAsFamily;
exports.getFamilyRecipes = getFamilyRecipes;
exports.getFamilyRecipeFromId = getFamilyRecipeFromId;
exports.getFamilyRecipesIds = getFamilyRecipesIds;
exports.getMyRecipes = getMyRecipes;
exports.getMyRecipesIds = getMyRecipesIds;
exports.getMyRecipeFromId = getMyRecipeFromId;
exports.getViewFromId = getViewFromId;
exports.getViewsId = getViewsId;
exports.getFavoritesId = getFavoritesId;
exports.getFavoriteFromId = getFavoriteFromId;
exports.createRecipe = createRecipe;
exports.removeFavorite = removeFavorite;

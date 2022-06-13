var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const DButils = require("../routes/utils/DButils");
const user_utils = require("./utils/user_utils");

// router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a full details of a recipe by its id
 */
router.get("/showRecipe", async (req, res, next) => {
  try {
    const recipeId=req.query.recipe_id;
    const recipe = await recipes_utils.getRecipeShow(recipeId);
    if(req.query.userName)
      await user_utils.markAsView(req.query.userName,recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});


router.get("/randomRecipes",async(req,res,next)=>{
  try{
    const randomRecipes=await recipes_utils.getRecipesRandom();
    let recipes_id_array=[]
    let views=[];
    let favorites=[];
    if(req.query.userName){
      randomRecipes.map((element) => recipes_id_array.push(element.id));
      views = await user_utils.getViewsId(recipes_id_array,req.query.userName);
      favorites = await user_utils.getFavoritesId(recipes_id_array,req.query.userName);
    }
    res.status(200).send({ random:randomRecipes,view:views,favorite:favorites});
  }catch(error){
    next(error);
  }
});

router.get("/search",async(req,res,next)=>{
  try{
    const recipes=await recipes_utils.searchRecipes(req.query.RecipeName,req.query.numberOfRecipe,req.query.cuisine,req.query.diet,req.query.intolerance);
    let views=[];
    let favorites=[];
    let recipes_id_array=[];
    if(req.query.userName){
      recipes.map((element) => recipes_id_array.push(element.id));
      views = await user_utils.getViewsId(recipes_id_array,req.query.userName);
      favorites = await user_utils.getFavoritesId(recipes_id_array,req.query.userName);
    }
    res.status(200).send({ search:recipes,view:views,favorite:favorites});
  }catch(error){
    next(error);
  }
});

router.post("/createRecipe/",async(req,res,next)=>{
  try{
    let len=0;
    const arr=await DButils.execQuery(`select count(*) as rid from recipes`);
    if (arr)
      len=arr[0].rid+1;
    let a="";
    if(req.body.owner)
      a=`,'${req.body.owner}','${req.body.customaryPrepare}'`;
    else a=",'',''";
    await DButils.execQuery(`insert into recipes values (${len},'${req.body.recipeName}','${req.body.image}','${req.body.preparationTime}',${req.body.clickable},'${req.body.ingredients}','${req.body.preparationInstructions}',${req.body.numberOfDishes},${req.body.vegetarianOrVegan},${req.body.gluten}${a})`);
    res.status(201).send({ message: `Recipe ${len} was created successfully`, success: true ,recipe_id: len});
  }catch(error){
    next(error);
  }
});

router.post("/createRecipe/:userName/:recipe_id",async(req,res,next)=>{
  try{
      let flag=await user_utils.createRecipe(req.params.userName,req.params.recipe_id);
      if (flag)
        res.status(200).send("my recipe update");
      else res.sendStatus(401);
  }catch(error){
    next(error);
  }
});




module.exports = router;







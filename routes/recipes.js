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
    if (req.session && req.session.user_id) {
      const userName = req.session.user_id;
      await user_utils.markAsView(userName,recipeId);
    }
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
    if(req.session && req.session.user_id){
      const userName = req.session.user_id;
      randomRecipes.map((element) => recipes_id_array.push(element.id));
      views = await user_utils.getViewsId(recipes_id_array,userName);
      favorites = await user_utils.getFavoritesId(recipes_id_array,userName);
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
    if(req.session && req.session.user_id){
      const userName = req.session.user_id;
      recipes.map((element) => recipes_id_array.push(element.id));
      views = await user_utils.getViewsId(recipes_id_array,userName);
      favorites = await user_utils.getFavoritesId(recipes_id_array,userName);
    }
    res.status(200).send({ search:recipes,view:views,favorite:favorites});
  }catch(error){
    next(error);
  }
});

router.post("/createRecipe/",async(req,res,next)=>{
  try{
    if(req.session && req.session.user_id){
      const userName = req.session.user_id;
      let len=0;
      const arr=await DButils.execQuery(`select count(*) as rid from recipes`);
      if (arr)
        len=arr[0].rid+1;
      let a="";
      if(req.body.owner)
        a=`,'${req.body.owner}','${req.body.customaryPrepare}'`;
      else a=",'',''";
      await DButils.execQuery(`insert into recipes values (${len},'${req.body.recipeName}','${req.body.image}','${req.body.preparationTime}',${req.body.clickable},'${req.body.ingredients}','${req.body.preparationInstructions}',${req.body.numberOfDishes},${req.body.vegetarian},${req.body.vegan},${req.body.gluten}${a})`);
      await user_utils.createRecipe(userName,len);
      res.status(201).send({ message: `Recipe ${len} was created successfully`, success: true ,recipe_id: len});
    }else res.sendStatus(401);
  }catch(error){
    next(error);
  }
});




module.exports = router;







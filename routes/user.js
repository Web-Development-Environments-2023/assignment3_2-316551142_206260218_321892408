var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
 router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT userName FROM users").then((users) => {
      if (users.find((x) => x.userName === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const userName = req.session.user_id;
    const recipe_id = req.body.reciepeId;
    let flag=await user_utils.markAsFavorite(userName,recipe_id);
    if (flag)
      res.status(200).send("The Recipe successfully saved as favorite");
    else res.sendStatus(401);
    } catch(error){
    next(error);
  }
})


router.post('/removeFavorite', async (req,res,next) => {
  try{
    const userName = req.session.user_id;
    const recipe_id = req.body.reciepeId;
    let flag=await user_utils.removeFavorite(userName,recipe_id);
    if (flag)
      res.status(200).send("The Recipe successfully removed");
    else res.sendStatus(401);
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const userName = req.session.user_id;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(userName);
    if (recipes_id){
      let recipes_id_array = [];
      recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
      const results = await recipe_utils.getRecipesPreview(recipes_id_array);
      res.status(200).send(results);
    }
    else res.sendStatus(401);
  } catch(error){
    next(error); 
  }
});



router.get("/userOn",async(req,res,next)=>{
  try{
    const userName = req.session.user_id;
    const recipes_id = await user_utils.getViewRecipes(userName);
    if (recipes_id){
      let recipes_id_array = [];
      recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
      const results = await recipe_utils.getRecipesPreview(recipes_id_array);
      let favorites=[];
      favorites = await user_utils.getFavoritesId(recipes_id_array,userName);
      res.status(200).send({result:results,favorite:favorites});
    }
    else res.sendStatus(401);
  }catch(error){
    next(error);
  }
});

router.get("/myFamily",async(req,res,next)=>{
  try{
    const userName = req.session.user_id;
    const recipes_id = await user_utils.getFamilyRecipes(userName);
    if (recipes_id){
      let recipes_id_array = [];
      recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
      let results=await user_utils.getFamilyRecipesIds(recipes_id_array);
      res.status(200).send(results);
    }
    else res.sendStatus(401);
  }catch(error){
    next(error);
  }
});

router.post('/myFamily', async (req,res,next) => {
  try{
    const userName = req.session.user_id;
    const recipe_id = req.body.reciepeId;
    let flag=await user_utils.markAsFamily(userName,recipe_id);
    if (flag)
      res.status(200).send("The Recipe successfully saved as family");
      else res.sendStatus(401);
    } catch(error){
    next(error);
  }
});

router.get("/myRecipe",async(req,res,next)=>{
  try{
    const userName = req.session.user_id;
    const recipes_id = await user_utils.getMyRecipes(userName);
    if (recipes_id){
      let recipes_id_array = [];
      recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
      let results=await user_utils.getMyRecipesIds(recipes_id_array);
      res.status(200).send(results);
    }
    else res.sendStatus(401);
  }catch(error){
    next(error);
  }
});


module.exports = router;

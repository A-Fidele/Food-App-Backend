var express = require("express");
const Recipe = require("../models/recipes");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const User = require("../models/users");
require("../models/connection");

router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find();

    if (recipes.length > 0) {
      res.json({ result: true, recipes });
    } else {
      res.status(404).json({ result: false, message: "No recipes found" });
    }
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

router.post("/findRecipeById", async (req, res) => {
  if (!checkBody(req.body, ["id", "email"])) {
    res.json({ result: false, error: "Tous les champs ne sont pas remplis!" });
    return;
  }
  try {
    Recipe.findOne({ _id: req.body.id }).then((recipeFound) => {
      if (!recipeFound) {
        res.json({ result: false, error: "No recipe found" });
      } else {
        User.findOne({ email: req.body.email }).then((userFound) => {
          if (userFound) {
            console.log(
              "userFound.favorites: ",
              userFound.favorites,
              "recipeFound:",
              recipeFound._id
            );
            const isFavoriteFound = userFound.favorites.includes(
              recipeFound._id
            );
            res.json({
              result: true,
              recipe: recipeFound,
              isFavorite: isFavoriteFound,
            });
          }
        });
      }
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ result: false, error: "Internal server error" });
  }
});

router.post("/insert", (req, res) => {
  if (
    !checkBody(req.body, [
      "name",
      "desc",
      "color",
      "image",
      "level",
      "longDesc",
      "rating",
      "serving",
      "servingNb",
      "time",
      "ingredients",
    ])
  ) {
    res.json({ result: false, error: "Tous les champs ne sont pas remplis!" });
    return;
  }

  const newRecipe = new Recipe({
    name: req.body.name,
    desc: req.body.desc,
    color: req.body.color,
    image: req.body.image,
    level: req.body.level,
    longDesc: req.body.longDesc,
    rating: req.body.rating,
    serving: req.body.serving,
    servingNb: req.body.servingNb,
    time: req.body.time,
    ingredients: req.body.ingredients,
  });

  newRecipe
    .save()
    .then((newDoc) => {
      res.json({ result: true, recipe: newDoc });
    })
    .catch((error) => {
      res.status(500).json({
        result: false,
        error: "Erreur lors de la sauvegarde de la recette",
      });
    });
});

module.exports = router;

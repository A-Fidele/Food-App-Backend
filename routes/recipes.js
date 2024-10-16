var express = require("express");
const Recipe = require("../models/recipes");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
require("../models/connection");

router.get("/", (req, res) => {
  Recipe.find()
    .then((data) => {
      if (data) {
        res.json({ result: true, recipes: data });
      } else {
        res.json({ result: false, message: "No recipes found" });
      }
    })
    .catch((error) => {
      console.error("Error in fectching recipes", error);
      res.status(500).json({ result: false, error: "Erreur serveur" });
    });
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

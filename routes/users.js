var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

const User = require("../models/users");
const Recipe = require("../models/recipes");
require("../models/connection");

//print user
router.get("/", (req, res) => {
  User.find()
    .then((data) => {
      if (data.length > 0) {
        res.json({ result: true, users: data });
      } else {
        res.json({ result: false, message: "Aucun utilisateur trouvé" });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      res.status(500).json({ result: false, message: "Erreur serveur" });
    });
});

//signup
router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Tous les champs ne sont pas remplis" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(req.body.email)) {
    res.json({ result: false, error: "L'adresse mail n'est pas valide" });
    return;
  }

  User.findOne({ email: req.body.email }).then((data) => {
    if (data !== null) {
      res.json({ result: false, error: "L'email existe deja" });
      return;
    } else {
      const hash = bcrypt.hashSync(req.body.password, 10);
      const newUser = new User({
        pseudo: req.body.pseudo,
        email: req.body.email,
        password: hash,
        token: uid2(32),
        favorites: [],
      });
      newUser
        .save()
        .then((newData) => {
          res.json({ result: true, user: newData });
        })
        .catch((error) => {
          res.status(500).json({ result: false, message: "Erreur serveur" });
        });
    }
  });
});

//signin
router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Tous les champs ne sont pas remplis" });
    return;
  }

  User.findOne({ email: req.body.email }).then((data) => {
    if (data === null) {
      res.json({ result: false, error: "Aucun utilisateur n'existe" });
    } else {
      if (bcrypt.compareSync(req.body.password, data.password)) {
        res.json({ result: true, user: data });
      } else {
        res.json({ result: false, error: "Password incorrect" });
      }
    }
  });
});

//update favorites
router.post("/updateFavorites", (req, res) => {
  if (!checkBody(req.body, ["email", "recipeId"])) {
    res.json({ result: false, error: "Tous les champs ne sont pas remplis" });
    return;
  }

  User.findOne({ email: req.body.email })
    .then((userData) => {
      if (!userData) {
        res.json({ result: false, error: "No user exists" });
      } else {
        const isFavorite = userData.favorites.includes(req.body.recipeId);
        if (isFavorite) {
          User.updateOne(
            { email: req.body.email },
            { $pull: { favorites: req.body.recipeId } }
          )
            .then((data) => {
              res.json({
                result: true,
                message: "Recipe removed from favorites",
                userFavorites: data,
              });
            })
            .catch((error) => {
              console.error("Error removing recipe from favorites:", error);
              res.status(500).json({
                result: false,
                error: "Erreur serveur in Pulling recipe",
                isFavorite,
              });
            });
        } else {
          User.updateOne(
            { email: req.body.email },
            { $push: { favorites: req.body.recipeId } }
          )
            .then((updatedData) => {
              res.json({
                result: true,
                message: "Recipe added to favorites",
                updatedData,
              });
            })
            .catch((error) => {
              console.error("Error adding recipe to favorites:", error);
              res.status(500).json({
                result: false,
                error: "Erreur serveur in Pushing recipe",
                isFavorite,
              });
            });
        }
      }
    })
    .catch((error) => {
      console.error("Error finding user:", error);
      res.status(500).json({ result: false, error: "Error serveur" });
    });
});

//update serving
router.post("/updateServing", async (req, res) => {
  if (!checkBody(req.body, ["id", "servingNb"])) {
    res.json({ result: false, error: "Verify all fields" });
    return;
  }

  try {
    const updatedRecipe = await Recipe.findOneAndUpdate(
      { _id: req.body.id },
      { servingNb: req.body.servingNb },
      { new: true } // Cette option renvoie le document mis à jour
    );
    if (updatedRecipe) {
      res.json({ result: true, recipe: updatedRecipe });
    } else {
      res.json({ result: false, error: "No recipe found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "Server error" });
  }
});

//print favorites
//Recipe.findOne est asynchrone, la réponse res.json est envoyée avant que toutes les requêtes asynchrones soient terminées.
//Pour résoudre ce problème, utilise Promise.all pour attendre la résolution de toutes les promesses dans userData.favorites avant d’envoyer la réponse finale

router.post("/favorites", (req, res) => {
  if (!checkBody(req.body, ["email"])) {
    res.json({ result: false, error: "Tous les champs ne sont pas remplis" });
    return;
  }

  User.findOne({ email: req.body.email }).then((userData) => {
    if (!userData) {
      res.json({ result: false, error: "No userfound" });
      return;
    } else {
      //console.log("user found", userData);
      const promises = userData.favorites.map((favoriteRecipesId) => {
        return Recipe.findOne({ _id: favoriteRecipesId });
      });

      Promise.all(promises).then((recipes) => {
        const foundRecipes = recipes.filter((recipe) => recipe !== null);
        console.log("foundRecipes length: ", foundRecipes.length);
        foundRecipes.forEach((data) => {
          console.log("foundRecipes", data);
        });

        if (foundRecipes.length > 0) {
          res.json({ result: true, favorites: foundRecipes });
        } else {
          res.json({ result: false, error: "No match found" });
        }
      });
    }
  });
});

module.exports = router;

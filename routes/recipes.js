var express = require("express");
const Recipe = require("../models/recipes");
var router = express.Router();
require("../models/connection");

/* GET home page. */
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

module.exports = router;

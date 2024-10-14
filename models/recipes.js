const mongoose = require("mongoose");

const ingredientSchema = mongoose.Schema({
  name: String,
  amount: Number,
  unit: String,
});

const recipeSchema = mongoose.Schema({
  id: Number,
  name: String,
  desc: String,
  image: String,
  color: String,
  serving: String,
  servingNb: Number,
  longDesc: String,
  level: String,
  time: String,
  rating: Number,
  ingredients: [ingredientSchema],
});

const Recipe = mongoose.model("recipes", recipeSchema);

module.exports = Recipe;

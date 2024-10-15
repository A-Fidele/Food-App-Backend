var express = require("express");
var router = express.Router();

const User = require("../models/users");
require("../models/connection");

/* GET users listing. */
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

module.exports = router;

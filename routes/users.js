var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

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

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["pseudo", "email", "password"])) {
    res.json({ result: false, error: "Tous les champs ne sont pas remplis" });
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

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Tous les champs ne sont pas remplis" });
    return;
  }

  User.findOne({ email: req.body.email }).then((data) => {
    if (data === null) {
      res.json({ result: false, error: "Aucun utilisateur n'existe" });
    } else {
      console.log("DATA signin", data);
      if (bcrypt.compareSync(req.body.password, data.password)) {
        res.json({ result: true, user: data });
      } else {
        res.json({ result: false, error: "Password incorrect" });
      }
    }
  });
});

module.exports = router;

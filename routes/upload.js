var express = require("express");
var router = express.Router();
const cloudinary = require("cloudinary").v2;
const uniqid = require("uniqid");
const fs = require("fs");
require("../models/connection");
const User = require("../models/users");

router.post("/", async (req, res) => {
  const photoPath = `./tmp/${uniqid()}.jpg`;
  const resultMove = await req.files.photoFromFront.mv(photoPath);

  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    res.json({ result: false, error: resultMove });
  }

  fs.unlinkSync(photoPath);
});

router.post("/upload", (req, res) => {
  Login.findOne({ login_token: req.body.token }).then((data) => {
    if (!data) {
      res.json({ result: false, error: "Missing User" });
      return;
    } else {
      User.updateOne(
        { login: data },
        {
          user_image: req.body.img,
        }
      ).then(() => {
        res.json({ result: true, message: "Informations mises à jour" });
      });
    }
  });
});

module.exports = router;

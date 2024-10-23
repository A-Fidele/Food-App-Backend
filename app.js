require("dotenv").config();

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var recipesRouter = require("./routes/recipes");
var usersRouter = require("./routes/users");
var uploadRouter = require("./routes/upload");

var app = express();
const cors = require("cors");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/recipes", recipesRouter);
app.use("/users", usersRouter);
app.use("/upload", uploadRouter);

module.exports = app;

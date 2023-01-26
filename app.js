//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const MONGO_URI = "mongodb://127.0.0.1:27017/userDB";

const app = express();

app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    //Create Document Schema
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
    });
    //Encryption
    console.log(process.env);
    userSchema.plugin(encrypt, {
      secret: process.env.SECRET,
      encryptedFields: ["password"],
    });

    //Create Document Model
    const User = new mongoose.model("User", userSchema);
    app
      .route("/login")
      .get((req, res) => {
        res.render("login", { loginTitle: "Login" });
      })
      .post((req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({ email: username }, (err, foundUser) => {
          if (!err) {
            if (foundUser.password === password) {
              res.render("secrets");
              console.log(foundUser.password);
            } else {
              res.render("login", { loginTitle: "Invalid Logins" });
              console.log("Wrong password entered");
            }
          } else {
            res.render("login", { loginTitle: "Invalid Username" });
            console.log(err);
          }
        });
      });

    app.route("/logout").get((req, res) => {
      res.render("home");
    });

    app.route("/").get((req, res) => {
      res.render("home");
    });

    app
      .route("/register")
      .get((req, res) => {
        res.render("register");
      })
      .post((req, res) => {
        const newUser = new User({
          email: req.body.username,
          password: req.body.password,
        });
        newUser.save((err) => {
          if (!err) {
            res.render("secrets");
          } else {
            console.log(err);
          }
        });
      });

    app.route("/login").post((req, res) => {
      const username = req.body.username;
      const password = req.body.password;

      User.findOne({ email: username }, (err, foundUser) => {
        if (err) {
          console.log(err);
        }
      });
    });

    app.listen(3000, () => {
      console.log("Server started on port 3000");
    });
  })
  .catch((err) => {
    if (!err) {
      console.log("DataBase Connection successful!");
    } else {
      console.log(err);
    }
  });

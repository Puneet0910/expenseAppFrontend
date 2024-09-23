const User = require("../models/user");
const sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();  // Ensure dotenv is required

function isStringValid(string) {
  return !string || string.length === 0;
}

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (isStringValid(name) || isStringValid(email) || isStringValid(password)) {
      return res.status(400).json({ err: "Bad parameters. Something is missing" });
    }

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).json({ err: "Failed to hash password" });
      }

      await User.create({
        name,
        email,
        password: hash,
      });

      res.status(201).json({ message: "Successfully created new user" });
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

function generateAccessToken(id, name) {
  return jwt.sign({ userId: id, name: name }, process.env.TOKEN_SECRET);  // Use environment variable
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findAll({ where: { email: email } });

    if (user.length > 0) {
      bcrypt.compare(password, user[0].password, (err, result) => {
        if (err) {
          throw new Error("Something went wrong");
        }
        if (result) {
          return res.status(200).json({
            success: true,
            message: "User Logged in Successfully",
            user: user,
            token: generateAccessToken(user[0].id, user[0].name),
          });
        } else {
          res.status(400).json({ success: false, message: "Password is incorrect" });
        }
      });
    } else {
      return res.status(404).json({ success: false, message: "User doesn't exist" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message, success: false });  // Use 500 for general errors
  }
};

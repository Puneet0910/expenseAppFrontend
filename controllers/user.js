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

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ err: "Email already in use" }); // HTTP status 409: Conflict
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


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email or password are missing
    if (!email || !password) {
      return res.status(400).json({ message: "Email or password is missing" });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password 
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.TOKEN_SECRET);
    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

//User info Controllers
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

//modals
const Users = require("../models/userModel");

//user registration
const userRegisteration = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    const isUserExist = await Users.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({ message: "User already exist" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = await Users.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword
    });

    if (userData) {
      res.status(201).json({ message: "User Regsitered successfully" });
    } else {
      res.status(400);
      throw new Error("User data is not valid");
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("All fields are required");
    }

    const user = await Users.find({ email });
    if (user.length === 0) {
      res.status(400);
      throw new Error("Invalid email or password");
    }

    if (user && (await bcrypt.compare(password, user[0].password))) {
      const accessToken = jwt.sign(
        {
          user: {
            _userInfo: user[0]._id,
          },
        },
        process.env.JWT_KEY,
        { expiresIn: "1d" }
      );
      res.cookie("accessToken", accessToken, {
        HttpOnly: true,
        //TODO: will turn it to true once ssl is configured
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "none",
      });
      res.status(200).json({ message: "login successful" });
    } else {
      res.status(400);
      throw new Error("email or password is not valid");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete User
const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    const o_id = new mongoose.Types.ObjectId(id);

    await Users.deleteOne({ _id: o_id });

    return res.status(200).json({ message: "User Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//current user
const currentUser = async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.user._userInfo });
    const { password, ...data } = await user.toJSON();

    res.status(200).json({ data, message: "Authorized user Information" });
  } catch (error) {
    res.status(400).json("User is not authorized1");
  }
};

//logout user
const logoutUser = (req, res) => {
  try {
    res.cookie("accessToken", "", { maxAge: 0 });
    res.status(200).json({ message: "User logged out" });
  } catch (error) {
    res.status(400).json({ Message: error.message });
  }
};

module.exports = {
  userRegisteration,
  loginUser,
  currentUser,
  logoutUser,
  deleteUser
};

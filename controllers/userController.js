//User info Controllers
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

//modals
const Users = require("../models/userModel");

//get user info
const all = async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
//get admin info only
const allAdmins = async (req, res) => {
  try {
    const users = await Users.find({ role: "admin" });
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
//get users info only
const allUsers = async (req, res) => {
  try {
    const users = await Users.find({ role: "user" });
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//user registration
const userRegisteration = async (req, res) => {
  try {
    const { name, phoneNumber, password, role, promoCode } = req.body;

    const isUserExist = await Users.findOne({ phoneNumber });
    if (isUserExist) {
      return res.status(400).json({ message: "User already exist" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const useData = await Users.create({
      name,
      phoneNumber,
      password: hashedPassword,
      role,
      promoCode
    });

    if (useData) {
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
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
      res.status(400);
      throw new Error("All fields are required");
    }

    const user = await Users.find({ phoneNumber });
    if (user.length === 0) {
      res.status(400);
      throw new Error("Invalid phoneNumber or password");
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
      throw new Error("phoneNumber or password is not valid");
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
  all,
  allAdmins,
  allUsers,
  userRegisteration,
  loginUser,
  currentUser,
  logoutUser,
  deleteUser
};

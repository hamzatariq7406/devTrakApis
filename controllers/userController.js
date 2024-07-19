//User info Controllers
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import { Types } from "mongoose";

//modals
import  User  from "../models/userModel.js";
import { ApiError } from "../ApiError.js";

//user registration
const userRegisteration = async (req, res,next) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    

    const isUserExist = await User.findOne({ email:email });

    console.log('user ', isUserExist)
    
    if (isUserExist) {
      
      return res.status(400).json({ message: "User already exist" });
    }
    const salt = await bcrypt.genSalt(10);
    console.log('salt ', salt)
    const hashedPassword = await bcrypt.hash(password,salt);
    console.log('i am here')
    

    const userData = await User.create({
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
    console.log(error)
     return next(new ApiError(500,"some thing wants wrong",error))
  }
};

const loginUser = async (req, res,next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("All fields are required");
    }

    const user = await find({ email });
    if (user.length === 0) {
      res.status(400);
      throw new Error("Invalid email or password");
    }

    if (user && (await bcrypt.compare(password, user[0].password))) {
      const accessToken = sign(
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
    return next(new ApiError(500,"some thing wants wrong",error))
 }
};

//delete User
const deleteUser = async (req, res,next) => {
  try {
    const id = req.query.id;
    const o_id = new Types.ObjectId(id);

    await deleteOne({ _id: o_id });

    return res.status(200).json({ message: "User Deleted" });
  } catch (error) {
    return next(new ApiError(500,"some thing wants wrong",error))
 }
};

//current user
const currentUser = async (req, res,next) => {
  try {
    const user = await findOne({ _id: req.user._userInfo });
    const { password, ...data } = await user.toJSON();

    res.status(200).json({ data, message: "Authorized user Information" });
  } catch (error) {
    return next(new ApiError(500,"some thing wants wrong",error))
 }
};

//logout user
const logoutUser = (req, res,next) => {
  try {
    res.cookie("accessToken", "", { maxAge: 0 });
    res.status(200).json({ message: "User logged out" });
  } catch (error) {
    return next(new ApiError(500,"some thing wants wrong",error))
 }
};

export {
  userRegisteration,
  loginUser,
  currentUser,
  logoutUser,
  deleteUser
};

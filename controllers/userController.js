//User info Controllers
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";
import { Types } from "mongoose";

//modals
import User from "../models/userModel.js";
import { ApiError } from "../ApiError.js";

//user registration
const userRegisteration = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;


    const isUserExist = await User.findOne({ email: email });
    if (isUserExist) {

      return res.status(400).json({ message: "User already exist" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);
    const confirmationToken = generateRandomCode();


    const userData = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      token: confirmationToken
    });

    if (userData) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SIGNUP_EMAIL,
          pass: process.env.SIGNUP_EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.SIGNUP_EMAIL,
        to: email,
        subject: 'DevTrak Account Creation Request',
        html: `
            <p>Hello,</p>
            <br />
            <p>Thank you for signing up with us!</p>
            <p>To complete your registration, please use the following confirmation code:</p>
            <br />
            <h2 style="background-color: #f0f0f0; padding: 10px; text-align: center;">${confirmationToken}</h2>
            <br />
            <p>If you didn't sign up for our service, please ignore this email.</p>
            <br />
            <p>Best regards,<br>DevTrak Team</p>
        `
      };

      transporter.sendMail(mailOptions);

      res.status(201).json({ message: "Email verification code sent successfully." });
    } else {
      res.status(400);
      throw new Error("User data is not valid");
    }
  } catch (error) {
    console.log(error)
    return next(new ApiError(500, "some thing wants wrong", error))
  }
};

const validateConfirmationToken = async (req, res) => {
  try {
    const { email, token } = req.body;

    const user = await Users.findOne({ email });

    if (!user) {
      res.status(400);
      throw new Error("No user exists with this email");
    }

    if (user.token !== token) {
      res.status(400);
      throw new Error("Token is not valid");
    }

    await Users.updateOne({ email }, { $set: { token: null } });

    res.status(200).json({ message: "Email verification successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("i am here")
    if (!email || !password) {
      res.status(400);
      throw new Error("All fields are required");
    }

    const user = await User.find({ email });
    if (user.length === 0) {
      res.status(400);
      throw new Error("Invalid email or password");
    }

    if (user && (await bcrypt.compare(password, user[0].password))) {

      if (user[0] && user[0]?.token) {
        res.status(401);
        throw new Error("Email verification is pending");
      }

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
      res.status(200).json({ message: "login successful",accessToken });
    } else {
      res.status(400);
      throw new Error("Email or password is not valid");
    }
  } catch (error) {
    console.log(error)
    return next(new ApiError(500, "some thing wants wrong", error))
  }
};

//delete User
const deleteUser = async (req, res, next) => {
  try {
    const id = req.query.id;
    const o_id = new Types.ObjectId(id);

    await User.deleteOne({ _id: o_id });

    return res.status(200).json({ message: "User Deleted" });
  } catch (error) {
    return next(new ApiError(500, "some thing wants wrong", error))
  }
};

//current user
const currentUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._userInfo });
    const { password, ...data } = await user.toJSON();

    res.status(200).json({ data, message: "Authorized user Information" });
  } catch (error) {
    return next(new ApiError(500, "some thing wants wrong", error))
  }
};

//logout user
const logoutUser = (req, res, next) => {
  try {
    res.cookie("accessToken", "", { maxAge: 0 });
    res.status(200).json({ message: "User logged out" });
  } catch (error) {
    return next(new ApiError(500, "some thing wants wrong", error))
  }
};

export {
  userRegisteration,
  loginUser,
  currentUser,
  logoutUser,
  deleteUser,
  validateConfirmationToken
};

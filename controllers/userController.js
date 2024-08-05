//User info Controllers
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import httpStatusCodes from "http-status-codes";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
//modals
import Users from "../models/userModel.js";
import { ApiError } from "../utils/ApiErrors.js";
import oauth2Client from "../utils/oauth2client.js";
import { generateRandomCode, generateRandomToken } from "../utils/methods.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendMail } from "../utils/sendmail.js";
import { EMAIL } from "../utils/constant.js";
import axios from "axios";
import path from "path";
import { uploadFile } from "../utils/S3.js";

//user registration
const userRegisteration = async (req, res, next) => {
  const { firstName, lastName, email, phone, password } = req.body;

  const isUserExist = await Users.findOne({ email: email });
  if (isUserExist) {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      "User already exist",
      httpStatusCodes.BAD_REQUEST
    );
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const confirmationToken = generateRandomCode();

  const userData = await Users.create({
    firstName,
    lastName,
    email,
    phone,
    password: hashedPassword,
    token: confirmationToken,
  });

  if (userData) {
    const a = await sendMail(
      email,
      EMAIL.USER_REGISTRATION_SUBJECT,
      EMAIL.USER_REGISTRATION_BODY(confirmationToken)
    );
    console.log(a);
    ApiResponse.result(
      res,
      { status: "User Regsitered successfully" },
      httpStatusCodes.OK
    );
  } else {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      "User data is not valid",
      httpStatusCodes.BAD_REQUEST
    );
  }
};

const validateConfirmationToken = async (req, res) => {
  const { email, token } = req.body;

  const user = await Users.findOne({ email });

  if (!user) {
    throw new ApiError(
      httpStatusCodes.INTERNAL_SERVER_ERROR,
      "No user exists with this email",
      httpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  if (user.token !== token) {
    throw new ApiError(
      httpStatusCodes.INTERNAL_SERVER_ERROR,
      "Token is not valid",
      httpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  await Users.updateOne({ email }, { $set: { token: null } });

  ApiResponse.result(
    res,
    { status: "Email verification successful" },
    httpStatusCodes.OK
  );
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      "All fields are required",
      httpStatusCodes.BAD_REQUEST
    );
  }

  const user = await Users.find({ email });
  if (user.length === 0) {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      "Invalid email or password",
      httpStatusCodes.BAD_REQUEST
    );
  }

  if (user && (await bcrypt.compare(password, user[0].password))) {
    if (user[0] && user[0]?.token) {
      throw new ApiError(
        httpStatusCodes.UNAUTHORIZED,
        "Email verification is pending",
        httpStatusCodes.UNAUTHORIZED
      );
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
    ApiResponse.result(res, { status: "Login Successful" }, httpStatusCodes.OK);
  } else {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      "Email or password is not valid",
      httpStatusCodes.BAD_REQUEST
    );
  }
};

//delete User
const deleteUser = async (req, res, next) => {
  const id = req.query.id;
  const o_id = new Types.ObjectId(id);

  await Users.deleteOne({ _id: o_id });
  ApiResponse.result(
    res,
    { status: "User deleted successfully" },
    httpStatusCodes.OK
  );
};

//current user
const currentUser = async (req, res, next) => {
  const user = await Users.findOne({ _id: req.user._userInfo });
  const { password, ...data } = await user.toJSON();

  ApiResponse.result(res, { user: data }, httpStatusCodes.OK);
};

const updateUser = async (req, res, next) => {
  const { firstName, lastName, phone } = req.body;

  let updateFields = {};

  // Add fields to the update object if they are defined
  if (firstName !== undefined) updateFields.firstName = firstName;
  if (lastName !== undefined) updateFields.lastName = lastName;
  if (phone !== undefined) updateFields.phone = phone;

  const user = await Users.updateOne(
    { _id: req.params.objectId },
    { $set: updateFields }
  );

  ApiResponse.result(res, { user }, httpStatusCodes.OK);
};

//logout user
const logoutUser = (req, res, next) => {
  res.cookie("accessToken", "", { maxAge: 0 });
  ApiResponse.result(
    res,
    { status: "User logged out successfully" },
    httpStatusCodes.OK
  );
};
const changePassword = async (req, res, next) => {
  const { oldpassword, newpassword } = req.body;
  const objectId = new Types.ObjectId(req.user._userInfo);
  if (!oldpassword || !newpassword) {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      "Old Password or new password is not provided",
      httpStatusCodes.BAD_REQUEST
    );
  }

  const user = await Users.findOne({ _id: objectId });
  if (user && (await bcrypt.compare(oldpassword, user.password))) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newpassword, salt);

    await Users.updateOne(
      { _id: objectId },
      { $set: { password: hashedPassword } }
    );

    ApiResponse.result(
      res,
      { message: "password changed successfully" },
      httpStatusCodes.OK
    );
  } else {
    throw new ApiError(
      httpStatusCodes.FORBIDDEN,
      "Invalid old password",
      httpStatusCodes.FORBIDDEN
    );
  }
};
const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      "Email is required",
      httpStatusCodes.BAD_REQUEST
    );
  }

  const user = await Users.findOne({ email: email });
  if (user) {
    const randomToken = generateRandomToken(24);
    await Users.updateOne({ email }, { $set: { token: randomToken } });

    sendMail(
      email,
      EMAIL.FORGOT_PASSWORD_SUBJECT,
      EMAIL.FORGOT_PASSWORD_BODY(randomToken)
    );
    ApiResponse.result(
      res,
      { message: "Email sent successfully." },
      httpStatusCodes.OK
    );
  } else {
    throw new ApiError(
      httpStatusCodes.FORBIDDEN,
      "Invalid Email",
      httpStatusCodes.FORBIDDEN
    );
  }
};
const verifyPasswordResetToken = async (req, res) => {
  const { password, token, phone } = req.body;

  if (!token) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      "Token is required",
      httpStatusCodes.UNPROCESSABLE_ENTITY
    );
  }
  const user = await Users.findOne({ token: token });

  if (!user) {
    throw new ApiError(
      httpStatusCodes.UNPROCESSABLE_ENTITY,
      "Token is invalid",
      httpStatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  let jwt;
  let updatedUser;
  bcrypt.hash(password, 10, async (_, hash) => {
    if (hash) {
      await Users.updateOne(
        { email: user.email },
        { $set: { password: hash, token: null, phone: phone } }
      );

      if (!user?.password) {
        jwt = generateJWTToken(user.email, user);
        updatedUser = {
          title: user.title,
          email: user.email,
          phone,
          role: user.role,
          ownerEmail: user.ownerCompanyEmail,
        };
        ApiResponse.result(
          res,
          { token: jwt, user: updatedUser },
          httpStatusCodes.OK
        );
      } else {
        ApiResponse.result(res, { status: "updated" }, httpStatusCodes.OK);
      }
    }
  });
};

const googleAuth = async (req, res) => {
  const { code } = req.body;

  const googleRes = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(googleRes.tokens);

  const userRes = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
  );

  const user = await Users.find({ email: userRes?.data?.email });
  if (user.length === 0) {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      "Invalid email ",
      httpStatusCodes.BAD_REQUEST
    );
  }

  if (user) {
    if (user[0] && user[0]?.token) {
      throw new ApiError(
        httpStatusCodes.UNAUTHORIZED,
        "Email verification is pending",
        httpStatusCodes.UNAUTHORIZED
      );
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
    ApiResponse.result(res, { status: "Login Successful" }, httpStatusCodes.OK);
  } else {
    throw new ApiError(
      httpStatusCodes.BAD_REQUEST,
      "Invalid User",
      httpStatusCodes.BAD_REQUEST
    );
  }
};
const upload = async (req, res, next) => {
  try {
    const picFile = req.files;

    if (!req.files) {
      throw new ApiError(
        httpStatusCodes.BAD_REQUEST,
        "Please Select File ",
        httpStatusCodes.BAD_REQUEST
      );
    }

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
    const fileName = Date.now() + picFile.pic.name;
    const fileData = picFile.pic.data;

    const fileExtension = path.extname(fileName).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      throw new ApiError(
        httpStatusCodes.BAD_REQUEST,
        "File must be in .jpg ,.jpeg , .png , .pdf format ",
        httpStatusCodes.BAD_REQUEST
      );
    }

    const result = await uploadFile(
      process.env.AWS_BUCKET_NAME,
      fileData,
      fileName
    );
    ApiResponse.result(
      res,
      { status: "File Upload Successfully" },
      httpStatusCodes.OK
    );
  } catch (error) {
    console.log(error);
  }
};

export {
  userRegisteration,
  loginUser,
  currentUser,
  logoutUser,
  deleteUser,
  validateConfirmationToken,
  updateUser,
  changePassword,
  forgetPassword,
  verifyPasswordResetToken,
  googleAuth,
  upload,
};

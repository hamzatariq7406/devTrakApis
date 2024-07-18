const express = require("express");
const userRouter = express.Router();
const {
  loginUser,
  userRegisteration,
  currentUser,
  logoutUser,
  deleteUser,
  validateConfirmationToken
} = require("../controllers/userController");

const validateToken = require("../middleware/validateTokenHandler");

userRouter.post("/login", loginUser);
userRouter.post("/register", userRegisteration);
userRouter.post(`/validateConfirmationToken`, validateConfirmationToken)
userRouter.get("/currentUser", validateToken, currentUser);
userRouter.post("/logout", logoutUser);
userRouter.post("/delete", validateToken, deleteUser);

module.exports = userRouter;

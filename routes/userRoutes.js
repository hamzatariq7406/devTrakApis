const express = require("express");
const userRouter = express.Router();
const {
  all,
  allAdmins,
  allUsers,
  loginUser,
  userRegisteration,
  currentUser,
  logoutUser,
  deleteUser,
} = require("../controllers/userController");

const validateToken = require("../middleware/validateTokenHandler");

userRouter.all("/all", validateToken, all);
userRouter.post("/allAdmins", validateToken, allAdmins);
userRouter.post("/allUsers", validateToken, allUsers);
userRouter.post("/login", loginUser);
userRouter.post("/register", userRegisteration);
userRouter.get("/currentUser", validateToken, currentUser);
userRouter.post("/logout", logoutUser);
userRouter.post("/delete", validateToken, deleteUser);

module.exports = userRouter;

import { Router } from "express";
import {
    loginUser,
    userRegisteration,
    currentUser, logoutUser,
    deleteUser,
    validateConfirmationToken
} from "../controllers/userController.js";

import validateToken from "../middleware/validateTokenHandler.js";
import asyncHandler from "../utils/AsyncHanlder.js";

const userRouter = Router();

userRouter.post("/login", asyncHandler(loginUser));
userRouter.post("/register", asyncHandler(userRegisteration));
userRouter.post("/validateConfirmationToken", asyncHandler(validateConfirmationToken));
userRouter.get("/currentUser", validateToken, asyncHandler(currentUser));
userRouter.post("/logout", asyncHandler(logoutUser));
userRouter.post("/delete", validateToken, asyncHandler(deleteUser));

export default userRouter;

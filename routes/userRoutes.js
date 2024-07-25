import { Router } from "express";
import {
    loginUser,
    userRegisteration,
    currentUser, logoutUser,
    deleteUser,
    validateConfirmationToken,
    updateUser,
    changePassword,
    forgetPassword,
    verifyPasswordResetToken
} from "../controllers/userController.js";

import validateToken from "../middleware/validateTokenHandler.js";
import asyncHandler from "../utils/AsyncHanlder.js";

const userRouter = Router();

userRouter.post("/login", asyncHandler(loginUser));
userRouter.post("/register", asyncHandler(userRegisteration));
userRouter.post("/validateConfirmationToken", asyncHandler(validateConfirmationToken));
userRouter.get("/currentUser", validateToken, asyncHandler(currentUser));
userRouter.put("/update/:objectId", validateToken, asyncHandler(updateUser));
userRouter.put("/changePassword", validateToken, asyncHandler(changePassword));
userRouter.post("/logout", asyncHandler(logoutUser));
userRouter.post("/delete", validateToken, asyncHandler(deleteUser));
userRouter.post("/forgetPassword", asyncHandler(forgetPassword));
userRouter.post("/verifyResetToken", asyncHandler(verifyPasswordResetToken));

export default userRouter;

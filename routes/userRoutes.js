import { Router } from "express";
const userRouter = Router();
import { loginUser, userRegisteration, currentUser, logoutUser, deleteUser } from "../controllers/userController.js";

import validateToken from "../middleware/validateTokenHandler.js";

userRouter.post("/login", loginUser);
userRouter.post("/register", userRegisteration);
userRouter.post(`/validateConfirmationToken`, validateConfirmationToken)
userRouter.get("/currentUser", validateToken, currentUser);
userRouter.post("/logout", logoutUser);
userRouter.post("/delete", validateToken, deleteUser);

export default userRouter;

import { Router } from "express";
const userRouter = Router();
import { loginUser, userRegisteration, currentUser, logoutUser, deleteUser, updateUser } from "../controllers/userController.js";

import validateToken from "../middleware/validateTokenHandler.js";

userRouter.post("/login", loginUser);
userRouter.post("/register", userRegisteration);
userRouter.get("/currentUser", validateToken, currentUser);
userRouter.post("/logout", logoutUser);
userRouter.post("/delete", validateToken, deleteUser);
userRouter.put("/updateuser/:id", validateToken, updateUser);
export default userRouter;

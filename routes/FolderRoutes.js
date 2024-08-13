import { Router } from "express";
import AddFolder from "../controllers/FolderController.js";
const FolderRoutes = Router();
import asyncHandler from "../utils/AsyncHanlder.js";

FolderRoutes.post("/addfolder", asyncHandler(AddFolder));

export default FolderRoutes;

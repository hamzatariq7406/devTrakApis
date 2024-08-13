import { Router } from "express";
import AddMatchingCar from "../controllers/CarController.js";
const CarRoutes = Router();
import asyncHandler from "../utils/AsyncHanlder.js";

CarRoutes.post("/addcar", asyncHandler(AddMatchingCar));

export default CarRoutes;

import dotenv from "dotenv";
dotenv.config();
import express from "express";
import * as errorHandler from "./middleware/errorHandler.js";
import connectDb from "./config/dbConnection.js";
import cookieParser from "cookie-parser";
import cors from "cors";

//Routes
import userRouter from "./routes/userRoutes.js";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";

const PORT = process.env.PORT || 9001;

//database connection
connectDb();

//app
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "4mb" }));
app.use(fileUpload());
app.options("/api", cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api", userRouter);
//app.use("/api/admin", adminRouter);

app.get("/api/testing", (req, res) => {
  res.send("API is running");
});

//errorHandler
app.use(errorHandler.notFoundErrorHandler);
app.use(errorHandler.errorHandler);

//port listening string
app.listen(PORT, () => {
  console.log("------------------------------------------------");
  console.log(`Status: Running`);
  console.log(`Listening to Port: ${PORT}`);
  console.log("-----------------------------------------------");
});

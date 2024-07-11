const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const connectDb = require("./config/dbConnection");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config();

//Routes
const userRouter = require("./routes/userRoutes");

const PORT = process.env.PORT || 9001;

//database connection
connectDb();

//app
const app = express();

app.use(cors());

app.options("/api", cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api", userRouter);
//app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
  res.send("API is running");
});

//errorHandler
app.use(errorHandler);

//port listening string
app.listen(PORT, () => {
  console.log("------------------------------------------------");
  console.log(`Status: Running`);
  console.log(`Listening to Port: ${PORT}`);
  console.log("-----------------------------------------------");
});

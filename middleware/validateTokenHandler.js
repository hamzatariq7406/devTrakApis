import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

const validateToken = asyncHandler(async (req, res, next) => {
  let token;
  // Get token from cookies
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  if (!token) {
    res.status(400);
    throw new Error("User is not authorized or token is missing");
  }

  try {
    const decoded =jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error(`User is not authorized: ${err.message}`);
  }
});

export default validateToken;

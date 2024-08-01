import { User } from "../Schema/User.js";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken"

// function to generate username
export const generateUsername = async (email) => {
  let username = email.split("@")[0];
  let isUsernameExists = await User.exists({
    "personal_info.username": username,
  }).then((res) => res);

  isUsernameExists ? (username += nanoid().substring(0, 5)) : "";

  return username;
};

// function to verify JWT for the authentication of user 
export const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    console.log("No token");
    return res.status(401).json({ message: "No access token" });
  }

  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
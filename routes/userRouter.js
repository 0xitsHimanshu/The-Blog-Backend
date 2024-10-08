import express from "express";
import { changePassword, changeProfileImg, editProfile, getProfile, googleAuth, searchUsers, signin, signup } from "../controllers/userController.js";
import { verifyJWT } from "../utils/helper.js";

const route = express.Router();

route.post("/signup", signup)
route.post("/signin", signin)
route.post("/search-users",searchUsers)
route.post("/get-profile", getProfile)
route.post("/change-profile-img", verifyJWT, changeProfileImg)
route.post("/update-profile", verifyJWT, editProfile)
route.post("/google-auth", googleAuth)
route.post("/change-password", verifyJWT, changePassword)
route.post("/get-details", verifyJWT, getProfile)
export default route;
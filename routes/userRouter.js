import express from "express";
import { googleAuth, searchUsers, signin, signup } from "../controllers/userController.js";

const route = express.Router();

route.post("/signup", signup)
route.post("/signin", signin)
route.post("/search-users",searchUsers)
route.post("/google-auth", googleAuth)

export default route;
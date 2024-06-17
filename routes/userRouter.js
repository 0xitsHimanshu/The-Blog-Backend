import express from "express";
import { googleAuth, signin, signup, test } from "../controllers/userController.js";

const route = express.Router();

route.get("/test", test);
route.post("/signup", signup)
route.post("/signin", signin)
route.post("/google-auth", googleAuth)

export default route;
import express from "express";
import { signin, signup, test } from "../controllers/userController.js";

const route = express.Router();

route.get("/test", test);
route.post("/signup", signup)
route.post("/signin", signin)

export default route;
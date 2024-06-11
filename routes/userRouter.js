import express from "express";
import { signup, test } from "../controllers/userController.js";

const route = express.Router();

route.get("/test", test);
route.post("/signup", signup)
route.post("/signin", )

export default route;
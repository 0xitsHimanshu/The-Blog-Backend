import express from "express";
import { createBlog } from "../controllers/blogController.js";
import { verifyJWT } from "../utils/helper.js";

const route = express.Router();

route.get("/test", (req, res) => res.send("Blog Router"));
route.post("/create-blog", verifyJWT ,createBlog);

export default route;
import express from "express";
import { createBlog, getLatestBlog, getTrendingBlog } from "../controllers/blogController.js";
import { verifyJWT } from "../utils/helper.js";

const route = express.Router();

route.get("/latest-blogs",getLatestBlog)
route.get("/trending-blogs", getTrendingBlog)
route.post("/create-blog", verifyJWT ,createBlog);

export default route;
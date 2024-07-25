import express from "express";
import { createBlog, getAllLatestBlogCount, getLatestBlog, getTrendingBlog, searchBlogs, searchBlogsCount } from "../controllers/blogController.js";
import { verifyJWT } from "../utils/helper.js";

const route = express.Router();

route.get("/trending-blogs", getTrendingBlog)
route.post("/latest-blogs",getLatestBlog)
route.post("/all-latest-blogs-count", getAllLatestBlogCount)
route.post("/search-blogs", searchBlogs);
route.post("/search-blogs-count",searchBlogsCount)
route.post("/create-blog", verifyJWT ,createBlog);

export default route; 
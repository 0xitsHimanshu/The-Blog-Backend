import express from "express";
import { AddComment, createBlog, getAllLatestBlogCount, getBlog, getComments, getLatestBlog, getTrendingBlog, islikedByUser, likeBlog, searchBlogs, searchBlogsCount } from "../controllers/blogController.js";
import { verifyJWT } from "../utils/helper.js";

const route = express.Router();

route.get("/trending-blogs", getTrendingBlog)
route.post("/latest-blogs",getLatestBlog)
route.post("/all-latest-blogs-count", getAllLatestBlogCount)
route.post("/search-blogs", searchBlogs);
route.post("/search-blogs-count",searchBlogsCount)
route.post("/get-blog", getBlog);
route.post("/like-blog", verifyJWT, likeBlog);
route.post("/get-comment", getComments);
route.post("/isliked-by-user", verifyJWT, islikedByUser);
route.post("/add-comment", verifyJWT, AddComment);
route.post("/create-blog", verifyJWT ,createBlog);

export default route; 
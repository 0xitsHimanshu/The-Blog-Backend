import express from "express";
import { AddComment, createBlog, delete_Comment, getAllLatestBlogCount, getBlog, getComments, getLatestBlog, getReplies, getTrendingBlog, islikedByUser, likeBlog, searchBlogs, searchBlogsCount } from "../controllers/blogController.js";
import { verifyJWT } from "../utils/helper.js";

const route = express.Router();

route.get("/trending-blogs", getTrendingBlog)
route.post("/latest-blogs",getLatestBlog)
route.post("/all-latest-blogs-count", getAllLatestBlogCount)
route.post("/search-blogs", searchBlogs);
route.post("/search-blogs-count",searchBlogsCount)
route.post("/get-blog", getBlog);
route.post("/like-blog", verifyJWT, likeBlog);
route.post("/isliked-by-user", verifyJWT, islikedByUser);
route.post("/add-comment", verifyJWT, AddComment);
route.post("/get-comment", getComments);
route.post("/delete-comment", verifyJWT, delete_Comment);
route.post("/get-replies", getReplies)
route.post("/create-blog", verifyJWT ,createBlog);

export default route; 
import express from "express";
import { createBlog } from "../controllers/blogController.js";

const route = express.Router();

route.get("/test", (req, res) => res.send("Blog Router"));
route.post("/create-blog", createBlog);

export default route;